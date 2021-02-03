BEHIND_PROXY = True
DEV = {
    'user': 'user',
    'pw': 'pw',
    'db': 'dev',
    'host': '127.0.0.1',
    'port': '5432',
}
TEST = {
    'user': 'testuser',
    'pw': 'testpassword',
    'db': 'test',
    'host': '127.0.0.1',
    'port': '5432',
}
SQLALCHEMY_DATABASE_URI = 'postgresql://%(user)s:%(pw)s@%(host)s:%(port)s/%(db)s' % DEV
SQLALCHEMY_BINDS = {
    'test': 'postgresql://%(user)s:%(pw)s@%(host)s:%(port)s/%(db)s' % TEST
}
SQLALCHEMY_TRACK_MODIFICATIONS = False
ENV = "development"
DEBUG = True
