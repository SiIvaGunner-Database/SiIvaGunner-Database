import io
import os
import environ
import google.auth
from google.cloud import secretmanager as sm

# Import the original settings from each template
from .basesettings import *

try:
    from .local import *
except ImportError:
    pass

# Pull django-environ settings file, stored in Secret Manager
SETTINGS_NAME = "application_settings"

_, project = google.auth.default()
client = sm.SecretManagerServiceClient()
name = f"projects/{project}/secrets/{SETTINGS_NAME}/versions/latest"
payload = client.access_secret_version(name=name).payload.data.decode("UTF-8")

env = environ.Env()
env.read_env(io.StringIO(payload))

# Setting this value from django-environ
SECRET_KEY = env("SECRET_KEY")

# Allow all hosts to access Django site
ALLOWED_HOSTS = ["*"]

# Default false. True allows default landing pages to be visible
DEBUG = False

# Set this value from django-environ
DATABASES = {"default": env.db()}

INSTALLED_APPS += ["storages"] # for django-storages
if "siivagunnerdb" not in INSTALLED_APPS:
     INSTALLED_APPS += ["siivagunnerdb"] # for custom data migration

# Define static storage via django-storages[google]
GS_BUCKET_NAME = env("GS_BUCKET_NAME")
STATICFILES_DIRS = []
DEFAULT_FILE_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
STATICFILES_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
GS_DEFAULT_ACL = "publicRead"
