"""
Django settings for cloud siivagunnerdb environments.
"""

import environ
import io
import os
import google.auth

from google.cloud import secretmanager
from .settings_core import *

ENV_NAME = os.environ.get('ENV_NAME')
SECRET_SETTINGS = f'siivagunnerdb-{ENV_NAME}-secrets'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = f'https://storage.googleapis.com/siivagunnerdb-{ENV_NAME}-media/'
MEDIA_URL = f'https://storage.googleapis.com/siivagunnerdb-{ENV_NAME}-media/uploads/'

# Get the environment from the secret manager
_, project = google.auth.default()
client = secretmanager.SecretManagerServiceClient()
name = f'projects/{project}/secrets/{SECRET_SETTINGS}/versions/latest'
payload = client.access_secret_version(name=name).payload.data.decode('UTF-8')
env = environ.Env()
env.read_env(io.StringIO(payload))

# Security settings
DEBUG = False
SECRET_KEY = env('SECRET_KEY')

# HTTPS enforcement. Cloud Run terminates TLS and forwards requests over HTTP with an
# X-Forwarded-Proto header, so Django must read that header to know a request was secure
# (without it, SECURE_SSL_REDIRECT would redirect forever).
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
# Browsers remember HSTS for this long, so start short and raise it (e.g. to 31536000)
# once HTTPS is confirmed working. Subdomains aren't included until each is confirmed HTTPS-only.
SECURE_HSTS_SECONDS = 3600
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
DATABASES = {'default': env.db()}
# Reuse database connections across requests instead of opening one per request.
# Values set in the DATABASE_URL (e.g. ?conn_max_age=0) take precedence.
DATABASES['default'].setdefault('CONN_MAX_AGE', 60)
DATABASES['default'].setdefault('CONN_HEALTH_CHECKS', True)

# App settings
INSTALLED_APPS += ['storages'] # for django-storages
if 'siivagunnerdb' not in INSTALLED_APPS:
    INSTALLED_APPS += ['siivagunnerdb'] # for custom data migration

# Define static storage via django-storages[google]
GS_BUCKET_NAME = f'siivagunnerdb-{ENV_NAME}-media'
DEFAULT_FILE_STORAGE = 'storages.backends.gcloud.GoogleCloudStorage'
STATICFILES_STORAGE = 'storages.backends.gcloud.GoogleCloudStorage'
GS_DEFAULT_ACL = 'publicRead'
