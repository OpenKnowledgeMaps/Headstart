from marshmallow import Schema, fields, pre_load


class SearchParamSchema(Schema):
    q = fields.Str(required=True)
    sorting = fields.Str(required=True)
    from_ = fields.Date(required=True, data_key="from",
                        format="%Y-%m-%d")
    to = fields.Date(required=True,
                     format="%Y-%m-%d")

    @pre_load
    def fix_years(self, in_data, **kwargs):
        if len(in_data.get('from')) == 4:
            in_data["from"] = in_data["from"]+"-01-01"
        if len(in_data.get('to')) == 4:
            in_data["to"] = in_data["to"]+"-12-31"
        return in_data
    #@validates('from_')
