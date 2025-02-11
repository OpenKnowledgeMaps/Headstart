FROM r-base-image

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONPATH="/headstart/:/headstart/metrics/:/headstart/metrics/src/"

# Install Python and other dependencies
RUN apt-get update && \
  apt-get install -y python3 python3-pip && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /headstart

# Copy the common module first so that the editable requirement (-e ../common) can be resolved
COPY workers/common ../common

# Install Python dependencies from requirements.txt
COPY workers/metrics/requirements.txt .
RUN pip3 install --no-cache-dir Cython && \
  pip3 install --upgrade pip && \
  pip3 install --no-cache-dir -r requirements.txt

# Now copy additional requirements which reference ../common
COPY workers/metrics/requirements-e.txt .
RUN pip3 install --no-cache-dir -r requirements-e.txt

# Copy remaining application files
COPY workers/metrics ./metrics
COPY preprocessing/resources ./resources
COPY preprocessing/other-scripts ./other-scripts

# Prepare log directory
RUN mkdir -p /var/log/headstart && touch /var/log/headstart/headstart.log

# Copy Python scripts for metrics
COPY workers/metrics/*.py ./

CMD ["python3", "run_metrics.py"]