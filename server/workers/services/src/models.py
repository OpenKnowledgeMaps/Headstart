from database import db


class Revisions(db.Model):
    rev_id = db.Column(db.Integer,
                       db.ForeignKey('visualizations.vis_latest'),
                       nullable=False,
                       primary_key=True)
    rev_vis = db.Column(db.Text, nullable=False,
                        primary_key=True)
    vis_query = db.Column(db.Text,
                          db.ForeignKey('visualizations.vis_clean_query'))
    rev_user = db.Column(db.Text)
    rev_timestamp = db.Column(db.DateTime)
    rev_comment = db.Column(db.Text)
    rev_data = db.Column(db.Text)


class Visualizations(db.Model):
    vis_id = db.Column(db.Text, nullable=False, unique=True,
                       primary_key=True)
    vis_query = db.Column(db.Text)
    vis_clean_query = db.Column(db.Text)
    vis_title = db.Column(db.Text)
    vis_latest = db.Column(db.Integer)
    vis_params = db.Column(db.Text)
