from database import Base
from sqlalchemy import Column, Text, Integer, Time, DateTime, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship


class Visualizations(Base):
    __tablename__ = "Visualizations"

    vis_id = Column(Text, nullable=False, unique=True,
                       primary_key=True)
    vis_query = Column(Text)
    vis_clean_query = Column(Text)
    vis_title = Column(Text)
    vis_latest = Column(Integer)
    vis_params = Column(Text)
    vis_changed = Column(Boolean)
    vis_changed_timestamp = Column(Time)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Revisions(Base):
    __tablename__ = "Revisions"

    rev_id = Column(Integer,
                       nullable=False,
                       primary_key=True)
    rev_vis = Column(Text,
                        nullable=False, unique=False,
                        primary_key=True)
    vis_query = Column(Text)
    rev_user = Column(Text)
    rev_timestamp = Column(DateTime)
    rev_comment = Column(Text)
    rev_data = Column(db.Text)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
