# !/bin/bash
# Running tests for functions from the server/workers/persistence/src/persistence.py locally

cd server || exit
cd workers || exit
cd persistence || exit
pip install --upgrade pip && pip install -r ./tests/requirements.txt
pytest -v