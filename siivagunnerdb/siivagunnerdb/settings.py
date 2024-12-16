"""
Default settings file loads settings for the appropriate environment.
"""

import os

ENV_NAME = os.environ.get('ENV_NAME')

if ENV_NAME:
    print(ENV_NAME + ' environment set. Using cloud settings.')
    from .settings_cloud import *
else:
    print('No environment set. Using local settings.')
    from .settings_local import *
