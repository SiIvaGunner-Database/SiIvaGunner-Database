from .basesettings import *

try:
    from .prodsettings import *
    print("Loaded production settings!")
except Exception as e:
    print("Failed to load production settings: " + str(e))
