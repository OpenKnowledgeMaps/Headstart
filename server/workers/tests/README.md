# How to run tests


Currently, some tests require the dockerized backend to run when testing e.g. data clients or the dataprocessing. This is because the R-parts of the backend are not easily integrated into the current testing framework.

Tests are run from the server/workers folder by running pytest in an environment (e.g. anaconda) that has the requirements (requirements.txt) installed.
