import warnings

RANDOM = None

def pytest_addoption(parser):
    parser.addoption(
        "--random", action="store_true", default=False, help="run randomized tests"
    )

def pytest_configure(config):
    warnings.warn("⚠️ WARNING: These tests are deprecated! ⚠️", DeprecationWarning)
    global RANDOM
    RANDOM = config.option.random
