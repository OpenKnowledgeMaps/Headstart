from datetime import datetime
from marshmallow import Schema, fields, pre_load, validates, ValidationError


class SearchParamSchema(Schema):
    q = fields.Str(required=True)
    sorting = fields.Str(required=True)
    from_ = fields.Date(required=True, data_key="from",
                        format="%Y-%m-%d")
    to = fields.Date(required=True,
                     format="%Y-%m-%d")
    vis_type = fields.Str(require=True)
    year_range = fields.Str()
    today = fields.Str()
    raw = fields.Boolean()

    @pre_load
    def fix_years(self, in_data, **kwargs):
        if len(in_data.get('from')) == 4:
            in_data["from"] = in_data["from"]+"-01-01"
        if len(in_data.get('to')) == 4:
            in_data["to"] = in_data["to"]+"-12-31"
        return in_data

    @validates('from_')
    def is_not_in_future(self, date):
        if date > datetime.today().date():
            raise ValidationError("Starting date can't be in the future.")
