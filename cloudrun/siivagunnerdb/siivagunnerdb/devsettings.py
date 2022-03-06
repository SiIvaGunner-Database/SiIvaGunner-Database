"""
Development Django settings for siivagunnerdb.
"""

import environ
import io
import os
import google.auth
from google.cloud import secretmanager as sm
from .settings import *

# Pull django-environ settings file, stored in Secret Manager
# This variable is currently the only difference from prodsettings.py
SECRET_SETTINGS = "siivagunnerdb-dev-secrets"

_, project = google.auth.default()
client = sm.SecretManagerServiceClient()
name = f"projects/{project}/secrets/{SECRET_SETTINGS}/versions/latest"
payload = client.access_secret_version(name=name).payload.data.decode("UTF-8")

env = environ.Env()
env.read_env(io.StringIO(payload))

# Setting this value from django-environ
SECRET_KEY = env("SECRET_KEY")

# Set this value from django-environ
DATABASES = {"default": env.db()}

INSTALLED_APPS += ["storages"] # for django-storages
if "siivagunnerdb" not in INSTALLED_APPS:
    INSTALLED_APPS += ["siivagunnerdb"] # for custom data migration

# Define static storage via django-storages[google]
GS_BUCKET_NAME = env("GS_BUCKET_NAME")
DEFAULT_FILE_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
STATICFILES_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
GS_DEFAULT_ACL = "publicRead"
