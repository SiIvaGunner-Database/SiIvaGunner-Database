try:
    from .localsettings import *
    from .local import *
    from .productionsettings import *
    print("Using production settings")
except ImportError:
    print("Using local settings")
    pass
