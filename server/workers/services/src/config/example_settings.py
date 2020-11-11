BEHIND_PROXY = True
POSTGRES = {
    'user': 'user',
    'pw': 'pw',
    'db': 'db',
    'host': '127.0.0.1',
    'port': '5432',
}
SQLALCHEMY_DATABASE_URI = 'postgresql://%(user)s:%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES
# SQLALCHEMY_DATABASE_URI = 'sqlite:////var/data/db.sqlite'
SQLALCHEMY_TRACK_MODIFICATIONS = False
ENV = "development"
DEBUG = True
