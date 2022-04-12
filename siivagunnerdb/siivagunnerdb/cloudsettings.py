"""
Django settings for cloud siivagunnerdb environments.
"""

import environ
import io
import os
import google.auth
from google.cloud import secretmanager
from .basesettings import *

ENV_NAME = os.environ.get("ENV_NAME")
SECRET_SETTINGS = f"siivagunnerdb-{ENV_NAME}-secrets"
STATIC_URL = f"https://storage.googleapis.com/siivagunnerdb-{ENV_NAME}-media/siivagunnerdb/static/"
MEDIA_URL = f"https://storage.googleapis.com/siivagunnerdb-{ENV_NAME}-media/usiivagunnerdb/ploads/"

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
GS_BUCKET_NAME = f"siivagunnerdb-{ENV_NAME}-media"
DEFAULT_FILE_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
STATICFILES_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
GS_DEFAULT_ACL = "publicRead"
