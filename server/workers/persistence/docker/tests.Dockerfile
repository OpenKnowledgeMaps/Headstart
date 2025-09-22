FROM python:3.9

WORKDIR /app

COPY ../tests/requirements.txt /app/requirements.txt
COPY ../src /app/src
COPY ../tests /app/tests
COPY ../pytest.ini /app/pytest.ini
COPY ../conftest.py /app/conftest.py

RUN pip install --upgrade pip && pip install -r requirements.txt

CMD ["pytest -v"]