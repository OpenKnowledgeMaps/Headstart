import os
import sys
import json
import time
import pickle
import uuid
import logging

import redis

from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

import pandas as pd
from pandas_schema import Column, Schema
from pandas_schema.validation import (InListValidation,
                                      DateFormatValidation)


def get_key(store, key):
    while True:
        res = store.get(key+"_output")
        if res is None:
            time.sleep(0.5)
        else:
            result = json.loads(res.decode('utf-8'))
            store.delete(key)
            store.delete(key+"_output")
            break
    return result


schema = Schema([
    Column('ID', []),
    Column('Title', []),
    Column('Authors', []),
    Column('Abstract', []),
    Column('Publication Venue', []),
    Column('Publication Date', [DateFormatValidation("%Y-%m-%d")]),
    Column('Link to PDF', []),
    Column('Keywords', []),
    Column('Access', []),
    Column('Comments', []),
    Column('Tags', []),
    Column('Included in map', [InListValidation(["yes", "no"])]),
    Column('Ready for publication?', [InListValidation(["yes", "no"])]),
    Column('Type', []),
    Column('Area', [])
])


class GSheetsClient(object):

    def __init__(self):
        # If modifying these scopes, delete the file token.pickle.
        self.SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly',
                       'https://www.googleapis.com/auth/drive.metadata.readonly']
        self.register_services()
        self.last_updated = {}
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(os.environ["GSHEETS_LOGLEVEL"])
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(os.environ["GSHEETS_LOGLEVEL"])
        self.logger.addHandler(handler)
        self.get_startPageToken()

    def authenticate(self):
        creds = None
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', self.SCOPES)
                creds = flow.run_local_server(port=0)
            # Save the credentials for the next run
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)
        return creds

    def register_services(self):
        self.gsheets_service = build('sheets', 'v4', credentials=self.authenticate())
        self.drive_service = build('drive', 'v3', credentials=self.authenticate())
        self.sheet = self.gsheets_service.spreadsheets()
        self.files = self.drive_service.files()

    def get_startPageToken(self):
        res = self.drive_service.changes().getStartPageToken().execute()
        self.startPageToken = res.get('startPageToken')

    def update_required(self, sheet_id):
        pageToken = self.last_updated[sheet_id] if sheet_id in self.last_updated else self.startPageToken
        res = self.drive_service.changes().list(pageToken=pageToken,
                                                spaces='drive').execute()
        if res is not None:
            filtered_changes = [c for c in res.get('changes') if c.get('fileId')==sheet_id]
            if len(filtered_changes) != 0:
                last_change = filtered_changes[-1]
                self.last_updated[sheet_id] = res.get('newStartPageToken')
                return last_change.get('time')
            else:
                return False
        else:
            return False

    def next_item(self):
        queue, msg = redis_store.blpop("gsheets")
        msg = json.loads(msg)
        k = msg.get('id')
        params = msg.get('params')
        params["service"] = "gsheets"
        endpoint = msg.get('endpoint')
        return k, params, endpoint

    def get_sheet_content(self, sheet_id, sheet_range):
        res = res = self.sheet.values().get(spreadsheetId=sheet_id,
                                            range=sheet_range).execute()
        raw = pd.DataFrame(res.get('values'))
        return raw

    @staticmethod
    def validate_data(df):
        """
        errors: [
            {
                row: 31,
                column: "Publication date",
                reason: "\"2020-04-0\" does not match the date format string \"%Y-%m-%d\"",
                data: {Abstract: "Now testing changes API, looks good, does it register two changes?" ...}
            },
        ]
        """
        df.columns = df.iloc[0]
        df.drop([0, 1, 2], inplace=True)
        df = df[(df["Ready for publication?"] == "yes") &
                (df["Included in map"] == "yes")]
        errors = schema.validate(df)
        errors_index_rows = [e.row for e in errors]
        error_columns = [e.column for e in errors]
        error_reasons = [" ".join([e.value, e.message]) for e in errors]
        if errors_index_rows == [-1]:
            clean_df = df
            errors_df = pd.DataFrame(columns=["row", "column", "reason", "data"])
        else:
            clean_df = df.drop(index=errors_index_rows)
            errors_df = pd.DataFrame(columns=["row", "column", "reason", "data"])
            errors_df["row"] = errors_index_rows
            errors_df["row"] += 1  # to align with google sheet rows
            errors_df["column"] = error_columns
            errors_df["reason"] = error_reasons
            errors_df["data"] = df.loc[errors_index_rows].to_dict(orient="records")
        return clean_df, errors, errors_df

    @staticmethod
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
        oa_mapper = {"closed": 0,
                     "open": 1,
                     "unknown": 2,
                     "free": 3}
        result_df["oa_state"] = result_df["oa_state"].map(lambda x: oa_mapper.get(x, 2))
        return result_df

    @staticmethod
    def create_input_data(df):
        metadata = pd.DataFrame()
        metadata["id"] = df.ID
        metadata["title"] = df.Title
        metadata["authors"] = df.Authors
        metadata["paper_abstract"] = df.Abstract.map(lambda x: x.replace("N/A", "") if isinstance(x, str) else "")
        metadata["published_in"] = df["Publication Venue"]
        metadata["year"] = df["Publication Date"]
        metadata["url"] = df.ID
        metadata["readers"] = 0
        metadata["subject"] = df.Keywords
        metadata["oa_state"] = df.Access
        metadata["link"] = df["Link to PDF"]
        metadata["relevance"] = df.index
        metadata["comments"] = df.Comments
        metadata["tags"] = df.Tags.map(lambda x: x.replace("N/A", "") if isinstance(x, str) else "")
        metadata["resulttype"] = df.Type
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

    def update(self, params):
        sheet_id = params.get('sheet_id')
        sheet_range = params.get('sheet_range')
        last_update = self.update_required(sheet_id)
        if last_update is not False:
            raw = self.get_sheet_content(sheet_id, sheet_range)
            clean_df, errors, errors_df = self.validate_data(raw)
            input_data = self.create_input_data(clean_df)
            map_k = str(uuid.uuid4())
            map_input = {}
            map_input["id"] = map_k
            map_input["input_data"] = input_data
            map_input["params"] = params
            redis_store.rpush("input_data", json.dumps(map_input))
            result = get_key(redis_store, map_k)
            result_df = self.post_process(clean_df, pd.DataFrame.from_records(json.loads(result)))
            res = {}
            res["data"] = result_df.to_json(orient="records")
            res["errors"] = errors_df.to_dict(orient="records")
            res["sheet_id"] = sheet_id
            res["last_update"] = last_update
        else:
            res = {"status": "No update required"}
        return res

    def run(self):
        while True:
            k, params, endpoint = self.next_item()
            self.logger.debug(k)
            self.logger.debug(params)
            try:
                res = self.update(params)
                redis_store.set(k+"_output", json.dumps(res))
            except Exception as e:
                self.logger.error(e)
                self.logger.error(params)


if __name__ == '__main__':
    with open("redis_config.json") as infile:
        redis_config = json.load(infile)

    redis_store = redis.StrictRedis(**redis_config)
    gc = GSheetsClient()
    gc.run()
