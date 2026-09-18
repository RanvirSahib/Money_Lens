# conftest.py — pytest configuration for the MoneyLens AI Service test suite.
#
# Adds the ai/ directory to sys.path so that `import app.*` works without
# installing the package. This mirrors the pattern used in the MoneyLens backend.

import sys
import pathlib

# Ensure the `ai/` directory (parent of `app/`) is on the path
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
