"""
Django settings for siivagunnerdb development environment.
"""

import environ
import io
import google.auth
from google.cloud import secretmanager
from .basesettings import *

# IMPORTANT: The below variables are the only ones different from prodsettings.py
SECRET_SETTINGS = "siivagunnerdb-dev-secrets"
STATIC_URL = 'https://storage.googleapis.com/siivagunnerdb-dev-media/static/'
STATICFILES_DIRS = []
MEDIA_URL = 'https://storage.googleapis.com/siivagunnerdb-dev-media/uploads/'
MEDIA_ROOT = []

# Get the environment from the secret manager
_, project = google.auth.default()
client = secretmanager.SecretManagerServiceClient()
name = f"projects/{project}/secrets/{SECRET_SETTINGS}/versions/latest"
payload = client.access_secret_version(name=name).payload.data.decode("UTF-8")
env = environ.Env()
env.read_env(io.StringIO(payload))

# Security settings
DEBUG = env("DEBUG")
SECRET_KEY = env("SECRET_KEY")
DATABASES = {"default": env.db()}

# App settings
INSTALLED_APPS += ["storages"] # for django-storages
if "siivagunnerdb" not in INSTALLED_APPS:
    INSTALLED_APPS += ["siivagunnerdb"] # for custom data migration

# Define static storage via django-storages[google]
GS_BUCKET_NAME = env("GS_BUCKET_NAME")
DEFAULT_FILE_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
STATICFILES_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
GS_DEFAULT_ACL = "publicRead"
