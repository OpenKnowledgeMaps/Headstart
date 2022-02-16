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
    year = metadata.get("year", "")
    doi = metadata.get("doi", "")
    id = metadata.get("id", "")
    published_in = metadata.get("published_in", "")
    url = metadata.get("list_link", {}).get("address", "")

    bibtextypes = [get_bibtextype(r) for r in metadata.get("resulttype")]
    if len(bibtextypes) == 0 or set(bibtextypes) == {"misc"}:
        entrytype = "misc"
    else:
        entrytype = list(filter(lambda x: x != "misc", bibtextypes))[0]    
    fields = {
        "title": title,
        "author": author,
        "year": year,
        "ID": id
    }
    if doi != "":
        fields["doi"] = doi
    if url != "":
        fields["url"] = url
    if entrytype == "article":
        if published_in != "":
            fields["journal"] = published_in
        else:
            entrytype = "misc"
    if entrytype == "misc" and published_in != "":
        entrytype = "article"
    if entrytype == "book":
        fields["publisher"] = published_in
    if entrytype == "inbook":
        fields["publisher"] = published_in
    if entrytype == "inproceedings":
        fields["booktitle"] = published_in
    if entrytype == "phdthesis":
        fields["school"] = published_in
    if entrytype == "mastersthesis":
        fields["school"] = published_in
    if entrytype == "conference":
        fields["booktitle"] = published_in
    fields["ENTRYTYPE"] = entrytype

    db = BibDatabase()
    writer = BibTexWriter()
    db.entries.append(fields)
    export = writer.write(db)
    result = {
        "format": "bibtex",
        "export": export
    }
    return result

def parse_published_in(published_in):
    pass

def transform2ris(metadata):
    pass

@export_ns.route('/<format>')
class exportMetadata(Resource):

    def post(self, format):
        try:
            metadata = request.json
            export_ns.logger.debug(metadata)
            if format == "bibtex":
                result = transform2bibtex(metadata)
                headers = {'ContentType': 'application/text'}
                code = 200
            elif format == "ris":
                result = transform2ris(metadata)
                headers = {'ContentType': 'application/text'}
                code = 200
            else: 
                result = {"status": "error",
                        "reason": "output format not recognized, must bei either bibtex or ris"}
                code = 400
            export_ns.logger.debug(result)
            headers = {'ContentType': 'application/json'}
            return make_response(jsonify(result),
                                code,
                                headers)
        except Exception as e:
            export_ns.logger.error(e)
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



def get_bibtextype(resulttype):
    mapper = {
        "Audio": "audio",
        "Book": "book",
        "Book part": "inbook",
        "Conference object": "conference / inproceedings // proceedings",
        "Course material": "misc",
        "Dataset": "misc",
        "Image/video": "misc",
        "Journal/newspaper": "misc",
        "Journal/newspaper article": "article",
        "Journal/newspaper other content": "misc",
        "Lecture": "misc",
        "Manuscript": "unpublished / misc",
        "Map": "misc",
        "Moving image/video": "video",
        "Musical notation": "misc",
        "Other/Unknown material": "misc",
        "Patent": "patent",
        "Report": "techreport / report",
        "Review": "misc",
        "Software": "software",
        "Still image": "misc",
        "Text": "misc",
        "Thesis": "thesis",
        "Thesis: bachelor": "thesis",
        "Thesis: doctoral and postdoctoral": "phdthesis",
        "Thesis: master": "mastersthesis",
        "Adaptive Clinical Trial": "misc",
        "Address": "misc",
        "Autobiography": "book",
        "Bibliography": "misc",
        "Biography": "book",
        "Book Illustrations": "misc",
        "Case Reports": "misc",
        "Classical Article": "article",
        "Clinical Conference": "conference",
        "Clinical Study": "misc",
        "Clinical Trial": "misc",
        "Clinical Trial Protocol": "misc",
        "Clinical Trial, Phase I": "misc",
        "Clinical Trial, Phase II": "misc",
        "Clinical Trial, Phase III": "misc",
        "Clinical Trial, Phase IV": "misc",
        "Clinical Trial, Veterinary": "misc",
        "Collected Work": "misc",
        "Collected Works": "misc",
        "Comment": "misc",
        "Comparative Study": "misc",
        "Congress": "conference",
        "Consensus Development Conference": "conference",
        "Consensus Development Conference, NIH": "conference",
        "Controlled Clinical Trial": "misc",
        "Corrected and Republished Article": "article",
        "Dataset": "misc",
        "Dictionary": "misc",
        "Directory": "misc",
        "Duplicate Publication": "misc",
        "Editorial": "article",
        "Electronic Supplementary Materials": "electronic",
        "English Abstract": "misc",
        "Ephemera": "misc",
        "Equivalence Trial": "misc",
        "Evaluation Studies": "misc",
        "Evaluation Study": "misc",
        "Expression of Concern": "misc",
        "Festschrift": "misc",
        "Government Publication": "misc",
        "Guideline": "misc",
        "Historical Article": "article",
        "Interactive Tutorial": "misc",
        "Interview": "misc",
        "Introductory Journal Article": "article",
        "Journal Article": "article",
        "Lecture": "misc",
        "Legal Case": "misc",
        "Legislation": "misc",
        "Letter": "misc",
        "Manuscript": "unpublished",
        "Meta-Analysis": "misc",
        "Multicenter Study": "misc",
        "News": "misc",
        "Newspaper Article": "article",
        "Observational Study": "misc",
        "Observational Study, Veterinary": "misc",
        "Overall": "misc",
        "Patient Education Handout": "misc",
        "Periodical Index": "misc",
        "Personal Narrative": "misc",
        "Pictorial Work": "misc",
        "Popular Work": "misc",
        "Portrait": "misc",
        "Practice Guideline": "misc",
        "Pragmatic Clinical Trial": "misc",
        "Preprint": "misc",
        "Publication Components": "misc",
        "Publication Formats": "misc",
        "Publication Type Category": "misc",
        "Published Erratum": "misc",
        "Randomized Controlled Trial": "misc",
        "Randomized Controlled Trial, Veterinary": "misc",
        "Research Support, American Recovery and Reinvestment Act": "misc",
        "Research Support, N.I.H., Extramural": "misc",
        "Research Support, N.I.H., Intramural": "misc",
        "Research Support, Non-U.S. Gov't": "misc",
        "Research Support, U.S. Gov't, Non-P.H.S.": "misc",
        "Research Support, U.S. Gov't, P.H.S.": "misc",
        "Retracted Publication": "misc",
        "Retraction of Publication": "misc",
        "Review": "misc",
        "Scientific Integrity Review": "misc",
        "Study Characteristics": "misc",
        "Support of Research": "misc",
        "Systematic Review": "misc",
        "Technical Report": "techreport / report",
        "Twin Study": "misc",
        "Validation Study": "misc",
        "Video Audio Media": "video",
        "Webcasts": "misc"
    }
    return mapper.get(resulttype, "article")