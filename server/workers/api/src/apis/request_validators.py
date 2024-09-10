from datetime import datetime
from marshmallow import Schema, fields, pre_load, validates, ValidationError


class SearchParamSchema(Schema):
    q = fields.Str()
    q_advanced = fields.Str()
    sorting = fields.Str(required=True)
    from_ = fields.Date(required=True, data_key="from",
                        format="%Y-%m-%d")
    to = fields.Date(required=True,
                     format="%Y-%m-%d")
    vis_type = fields.Str(required=True)
    limit = fields.Int()
    year_range = fields.Str()
    today = fields.Str()
    language = fields.Str()
    lang_id = fields.List(fields.Str())
    time_range = fields.Str()
    document_types = fields.List(fields.Str())
    article_types = fields.List(fields.Str())
    unique_id = fields.Str()
    raw = fields.Boolean()
    sg_method = fields.Str()
    coll = fields.Str()
    vis_id = fields.Str(default=None)
    optradio = fields.Str()
    service = fields.Str()
    embed = fields.Str()
    min_descsize = fields.Int()
    repo = fields.Str()
    repo_name = fields.Str()
    coll = fields.Str()
    list_size = fields.Int()
    custom_title = fields.Str()
    custom_clustering = fields.Str()
    academic_age_offset = fields.Int()


    @pre_load
    def fix_years(self, in_data, **kwargs):
        if not in_data:
            in_data = {}

        from_date = in_data.get('from')
        to_date = in_data.get('to')
        if from_date and len(from_date) == 4:
            in_data["from"] = from_date + "-01-01"
        if to_date and len(to_date) == 4:
            in_data["to"] = to_date + "-12-31"

    @pre_load
    def fix_limit(self, in_data, **kwargs):
        try:
            in_data["limit"] = int(in_data["limit"])
            return in_data
        except Exception:
            return in_data

    @pre_load
    def filter_nonpublic(self, in_data, **kwargs):
        try:
            in_data["non_public"] = in_data["non_public"].lower().capitalize() == "True"
            return in_data
        except Exception:
            return in_data

    @pre_load
    def lang_id_empty_fallback(self, in_data, **kwargs):
        if in_data is None:
            in_data = {}  # Define in_data as an empty dictionary
        
        lang_id = in_data.get("lang_id")
        if lang_id:
            lang_id = list(filter(lambda x: x != "", lang_id))
            if len(lang_id) == 0:
                in_data["lang_id"] = ["all-lang"]
        
        return in_data

    @validates('from_')
    def is_not_in_future(self, date):
        if date > datetime.today().date():
            raise ValidationError("Starting date can't be in the future.")

    @validates('limit')
    def limit_is_int(self, limit):
        if not isinstance(limit, int):
            raise ValidationError("Limit must be an integer.")