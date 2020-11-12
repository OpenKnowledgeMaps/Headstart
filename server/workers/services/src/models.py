from database import db
from sqlalchemy import ForeignKey, Table
from sqlalchemy.orm import relationship


class Visualizations(db.Model):
    vis_id = db.Column(db.Text, nullable=False, unique=True,
                       primary_key=True)
    vis_query = db.Column(db.Text)
    vis_clean_query = db.Column(db.Text)
    vis_title = db.Column(db.Text)
    vis_latest = db.Column(db.Integer)
    vis_params = db.Column(db.Text)
    vis_changed = db.Column(db.Boolean)
    vis_changed_timestamp = db.Column(db.Time)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Revisions(db.Model):
    rev_id = db.Column(db.Integer,
                       nullable=False,
                       primary_key=True)
    rev_vis = db.Column(db.Text,
                        nullable=False, unique=False,
                        primary_key=True)
    vis_query = db.Column(db.Text)
    rev_user = db.Column(db.Text)
    rev_timestamp = db.Column(db.DateTime)
    rev_comment = db.Column(db.Text)
    rev_data = db.Column(db.Text)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class TripleVisualizations(Visualizations):
    pass


class TripleRevisions(Revisions):
    pass
