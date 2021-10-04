try:
    print("Loading base settings")
    from .basesettings import *
    print("Loading local")
    from .local import *
    print("Loading production settings")
    from .prodsettings import *
    print("Done!")
except ImportError as error:
    print(error)
    pass
