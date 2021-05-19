from sqlalchemy import create_engine, select
from models import Visualizations, Revisions
from config import settings

engine_source = create_engine('sqlite:////home/chris/data/OKMaps/TRIPLE/triple.sqlite')
# engine_target = create_engine('postgresql+psycopg2://headstart:testpassword@172.18.0.2:5432/dev')
engine_target = create_engine('postgresql+psycopg2://%(user)s:%(pw)s@%(host)s:%(port)s/%(db)s' % settings.TRIPLE)

with engine_source.connect() as conn_source:
    with engine_target.connect() as conn_target:
        for table in Visualizations.metadata.sorted_tables:
            for row in conn_source.execute(select(table.c)):
                try:
                    conn_target.execute(table.insert().values(dict(row)))
                except Exception as e:
                    print(e)
