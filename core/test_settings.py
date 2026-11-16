from .settings import *

# The original migration history includes PostgreSQL-specific SQL. Tests use
# SQLite and create the final model schema without changing those migrations.
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
MIGRATION_MODULES = {'caso1_visitas': None}
