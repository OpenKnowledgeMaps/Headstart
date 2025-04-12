from datetime import datetime
from marshmallow import Schema, fields, pre_load, validates, ValidationError, EXCLUDE


class SearchParamSchema(Schema):
    class Meta:
        unknown = EXCLUDE
        
    q = fields.Str()
    q_advanced = fields.Str()
    sorting = fields.Str(required=True)
    from_ = fields.Date(data_key="from",
                        format="%Y-%m-%d")
    to = fields.Date(format="%Y-%m-%d")
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
    exclude_date_filters = fields.Boolean()
    custom_clustering = fields.Str()
    academic_age_offset = fields.Int(allow_none=True)
    enable_h_index = fields.Boolean(allow_none=True)
    enable_teaching_mentorship = fields.Boolean(allow_none=True)


    @pre_load
    def fix_years(self, in_data, **kwargs):
        if "from" in in_data:
            if len(in_data.get('from')) == 4:
                in_data["from"] = in_data["from"]+"-01-01"
        if "to" in in_data:
            if len(in_data.get('to')) == 4:
                in_data["to"] = in_data["to"]+"-12-31"
        return in_data

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

    @pre_load
    def fix_academic_age_offset(self, in_data, **kwargs):
        try:
            if "academic_age_offset" in in_data:
                in_data["academic_age_offset"] = int(in_data["academic_age_offset"])
        except (ValueError, TypeError):
            in_data["academic_age_offset"] = 0
        return in_data

    @pre_load
    def fix_enable_h_index(self, in_data, **kwargs):
        try:
            if "enable_h_index" in in_data:
                in_data["enable_h_index"] = in_data["enable_h_index"].lower().capitalize() == "True"
        except Exception:
            pass
        return in_data
    
    @pre_load
    def fix_enable_teaching_mentorship(self, in_data, **kwargs):
        try:
            if "enable_teaching_mentorship" in in_data:
                in_data["enable_teaching_mentorship"] = in_data["enable_teaching_mentorship"].lower().capitalize() == "True"
        except Exception:
            pass
        return in_data

    @validates('from_')
    def is_not_in_future(self, date):
        if date > datetime.today().date():
            raise ValidationError("Starting date can't be in the future.")

    @validates('limit')
    def limit_is_int(self, limit):
        if not isinstance(limit, int):
            raise ValidationError("Limit must be an integer.")