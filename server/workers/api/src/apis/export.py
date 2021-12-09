import os

from flask import Blueprint, request, make_response, jsonify, abort
from flask_restx import Namespace, Resource, fields
from bibtexparser.bwriter import BibTexWriter 
from bibtexparser.bibdatabase import BibDatabase

export_ns = Namespace("export", description="metadata export API operations")

def transform2bibtex(metadata):
    # TODO: add mapping from resulttype to ARTICLETYPE
    # possible published_in parser
    # field renaming, e.g. paper_abstract to abstract
    # choose correct fields, e.g. author_string for author
    # use different field for ID
    title = metadata.get("title", "")
    author = metadata.get("authors", "")
    abstract = metadata.get("abstract", "")
    year = metadata.get("year", "")
    doi = metadata.get("doi", "")
    id = metadata.get("id", "")
    fields = {
        "title": title,
        "author": author,
        "abstract": abstract,
        "year": year,
        "doi": doi,
        "ENTRYTYPE": "article",
        "ID": id
    }
    db = BibDatabase()
    writer = BibTexWriter()
    db.entries.append(fields)
    export = writer.write(db)
    return export

def parse_published_in(published_in):
    pass

def transform2ris(metadata):
    pass

@export_ns.route('/export/<format>')
class exportMetadata(Resource):

    def post(self, format):
        result = """@article{007f9e706022c47e76dc473387c78cd95c867ccd10a962ea6daa9fdeca329ca0,
            title={Calcium deposition within coronary atherosclerotic lesion: Implications for plaque stability},
            author={Hiroyuki Jinnouchi, Yu Sato, Atsushi Sakamoto, Anne Cornelissen, Masayuki Mori, Rika Kawakami, Neel V. Gadhoke, Frank D. Kolodgie, Renu Virmani, Aloke V. Finn},
            year={2020},
            journal={Atherosclerosis},
            volume={306},
            pages={85--95}
            issn={0021-9150}
            doi={10.1016/j.atherosclerosis.2020.05.017}
        }"""
        try:
            metadata = request.get_json()
            if format == "bibtex":
                exported_metadata = transform2bibtex(metadata)
            elif format == "ris":
                exported_metadata = transform2ris(metadata)
            else: 
                result = {"status": "error",
                        "reason": "output format not recognized, must bei either bibtex or ris"}
                return jsonify(result)
        except Exception as e:
            result = {'success': False, 'reason': e}
            headers = {'ContentType': 'application/json'}
            return make_response(jsonify(result),
                                 500,
                                 headers)


@export_ns.route('/service_version')
class ServiceVersion(Resource):
    def get(self):
        result = {"service_version": os.getenv("SERVICE_VERSION")}
        return make_response(result, 200, {"Content-Type": "application/json"})

@export_ns.route('/healthcheck')
class Healthcheck(Resource):
    def get(self):
        result = {"status": "I'm good"}
        return make_response(result, 200, {"Content-Type": "application/json"})