"""
Settings loader for siivagunnerdb.
"""

try:
    from .prodsettings import *
    print("Loaded production settings!")
except Exception as e:
    from .basesettings import *
    print("Failed to load production settings: " + str(e))
