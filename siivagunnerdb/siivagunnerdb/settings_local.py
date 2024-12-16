"""
Django settings for local siivagunnerdb environments.
"""

from django.core.management.utils import get_random_secret_key
from .settings_core import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = get_random_secret_key()

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Database connection
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# File serving URLs
STATIC_URL = '/static/'
MEDIA_URL = '/media/'
