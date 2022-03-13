"""
Default settings file loads settings for the appropriate environment.
"""

import os

# if os.environ.get("ENV_NAME"):
from .cloudsettings import *
# else:
#     from .localsettings import *
