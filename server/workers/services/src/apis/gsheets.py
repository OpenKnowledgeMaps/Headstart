import os
import json
import uuid
import pickle
import redis
from datetime import datetime

from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

from flask import Blueprint, request, make_response, jsonify, abort, render_template
from flask_restx import Namespace, Resource, fields
from apis.utils import get_key
from models import Revisions, Visualizations
from database import db
import pandas as pd
from pandas_schema import Column, Schema
from pandas_schema.validation import (MatchesPatternValidation,
                                      InListValidation,
                                      DateFormatValidation,
                                      CustomElementValidation)


with open("redis_config.json") as infile:
    redis_config = json.load(infile)

redis_store = redis.StrictRedis(**redis_config)

gsheets_ns = Namespace("google_sheets", description="Google Sheets API operations")
app = Blueprint('googlesheets', __name__)
# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']


# search_param_schema = SearchParamSchema()

def authenticate():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'config/credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    return creds


gsheets_service = build('sheets', 'v4', credentials=authenticate())
sheet = gsheets_service.spreadsheets()


# Call the Sheets API


def get_sheet_content(sheet_id, sheet_range):
    res = sheet.values().get(spreadsheetId=sheet_id,
                             range=sheet_range).execute()
    raw = pd.DataFrame(res.get('values'))
    return raw


def validate_data(df):
    schema = Schema([
        Column('ID', []),
        Column('Title', []),
        Column('Authors', []),
        Column('Abstract', []),
        Column('Publication Venue', []),
        Column('Publication Date', [DateFormatValidation("%Y-%m-%d")]),
        Column('Link to PDF', []),
        Column('Keywords', []),
        Column('Access', [InListValidation(["open", "closed", "unknown", "free"], case_sensitive=False)]),
        Column('Comments', []),
        Column('Tags', []),
        Column('Ready for inclusion in map?', [InListValidation(["yes", "no"])]),
        Column('Type', []),
        Column('Area', [])
    ])
    df.columns = df.iloc[0]
    df.drop([0, 1], inplace=True)
    # add column: Valid Bool
    df = df[df["Ready for inclusion in map?"] == "yes"]
    errors = schema.validate(df)
    errors_index_rows = [e.row for e in errors]
    for e in errors:
        e.row += 1
    error_messages = [str(e) for e in errors]
    if errors_index_rows == [-1]:
        clean_df = df
        errors_df = pd.DataFrame()
    else:
        clean_df = df.drop(index=errors_index_rows)
        errors_df = df.loc[errors_index_rows]
        errors_df["reason"] = error_messages
    return clean_df, errors, errors_df


def create_input_data(df):
    metadata = pd.DataFrame()
    metadata["id"] = df.ID
    metadata["title"] = df.Title
    metadata["authors"] = df.Authors
    metadata["paper_abstract"] = df.Abstract
    metadata["published_in"] = df["Publication Venue"]
    metadata["year"] = df["Publication Date"]
    metadata["url"] = df["Link to PDF"]
    metadata["readers"] = 0
    metadata["subject"] = df.Keywords
    metadata["oa_state"] = df.Access
    metadata["link"] = df["Link to PDF"]
    metadata["relevance"] = df.index
    metadata["comments"] = df.Comments
    metadata["tags"] = df.Tags
    metadata["type"] = df.Type
    text = pd.DataFrame()
    text["id"] = metadata["id"]
    text["content"] = metadata.apply(lambda x: ". ".join(x[["title",
                                                            "paper_abstract",
                                                            "subject",
                                                            "comments"]]), axis=1)
    input_data = {}
    input_data["metadata"] = metadata.to_json(orient='records')
    input_data["text"] = text.to_json(orient='records')
    return input_data


def post_process(clean_df, result_df):
    sorter = clean_df["ID"]
    sorterIndex = dict(zip(sorter, range(len(sorter))))
    result_df["orig_order"] = result_df["id"].map(sorterIndex)
    result_df.sort_values(["orig_order"], ascending=[True], inplace=True)
    result_df.drop("orig_order", axis=1, inplace=True)
    result_df.index = clean_df.index
    result_df["area"] = clean_df.Area
    uris = {a: i for i, a in enumerate(result_df.area.unique())}
    result_df["area_uri"] = result_df.area.map(lambda x: uris.get(x))
    return result_df


def get_sheet_id(vis_id):
    # mock functionality
    mock_db = {"covid19": "1csxG23x99DcxoEud782Bji76C7mGxKkAVMBz8gdf_0A"}
    # replace with e.g.
    # sheet_id = Visualizations.query.filter_by(vis_id=vis_id).first().???
    return mock_db.get(vis_id)


search_query = gsheets_ns.model("SearchQuery",
                                {"vis_id": fields.String(example='covid19',
                                                         description='hardcoded vis_id',
                                                         required=True)})


@gsheets_ns.route('/search')
class Search(Resource):
    @gsheets_ns.doc(responses={200: 'OK',
                               400: 'Invalid search parameters'})
    @gsheets_ns.expect(search_query)
    @gsheets_ns.produces(["application/json"])
    def post(self):
        """
        """
        params = request.get_json()
        # fill default params
        params["q"] = params["vis_id"]
        params["vis_type"] = "overview"
        params["service"] = "gsheets"
        gsheets_ns.logger.debug(params)
        sheet_id = get_sheet_id(params.get('vis_id'))
        covid19_range = "Resources!A1:N200"
        try:
            raw = get_sheet_content(sheet_id, covid19_range)
            clean_df, errors, errors_df = validate_data(raw)
            input_data = create_input_data(clean_df)
        except Exception as e:
            gsheets_ns.logger.error(e)
            abort(500, "Problem encountered during data collection, sorry")

        try:
            k = str(uuid.uuid4())
            res = {}
            res["id"] = k
            res["input_data"] = input_data
            res["params"] = params
            redis_store.rpush("input_data", json.dumps(res))
            result = get_key(redis_store, k)
            result_df = post_process(clean_df, pd.DataFrame(result))
            # result_df.index = result_df.index.astype(int)
            # result_df.sort_index(inplace=True)
            headers = {}
            headers["Content-Type"] = "application/json"
            result = {}
            result["data"] = result_df.to_dict(orient="records")
            result["context"] = {"id": "covid19",
                                 "query": "covid19",
                                 "service": "gsheets",
                                 "timestamp": datetime.utcnow(),
                                 "params": params}
            result["errors"] = errors_df.to_dict(orient="records")
            return make_response(result,
                                 200,
                                 headers)
        except Exception as e:
            gsheets_ns.logger.error(e)
            abort(500, "Problem encountered during processing, sorry.")


def writeRevision(vis_id, data, rev_id=None):

    vis = Visualizations.query.filter_by(vis_id=vis_id).first()

    rev = rev_id
    if rev is None:
        r_id = vis.vis_latest
        rev = r_id + 1

    query = vis.vis_clean_query

    new_rev = Revisions({
                "rev_id": rev,
                "rev_vis": vis_id,
                "rev_user": "System",
                "rev_timestamp": datetime.utcnow(),
                "rev_comment": "Visualization created",
                "rev_data": data,
                "vis_query": query
    })
    db.session.add(new_rev)
    db.session.commit()


@gsheets_ns.route('/createVisualization')
class createVisualization(Resource):
    def post(self, vis_id):
        # param: map_id
        # get map context for map ID
        # get latest revision data via sheets ID from context
        # if not assert equal
        # add revision number to map context
        # get latest revision
        pass


@gsheets_ns.route('/existsVisualization')
class existsVisualization(Resource):
    def get(self, vis_id):
        map = Visualizations.query.filter_by(vis_id=vis_id).first()
        exists = True if map else False
        make_response(exists,
                      200)


@app.route('/api/gsheets/raw')
def raw_exampe():
    """
    """
    params = request.args.to_dict()
    # params = request.get_json()
    # fill default params
    params["q"] = params["vis_id"]
    params["vis_type"] = "overview"
    params["service"] = "gsheets"
    sheet_id = get_sheet_id(params.get('vis_id'))
    covid19_range = "Resources!A1:N200"
    sheet_content = get_sheet_content(sheet_id, covid19_range)
    raw = pd.DataFrame(sheet_content.get('values'))
    clean_df, errors, errors_df = validate_data(raw)
    input_data = create_input_data(clean_df)
    return render_template("tables.html",
                           clean_df=clean_df.to_html(header=True),
                           errors="<br/>".join([str(e)
                                                for e in errors]),
                           errors_df=errors_df.to_html(header=True)
                           )
# @gsheets_ns.route('/get')
