# Make backend a package for test imports
import importlib as _importlib
main = _importlib.import_module('.main', __name__)
app = main.app
