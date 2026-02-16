# Log Performance Comparison

Compare "Time taken" statistics between two Headstart log files (e.g. before and after a change).

## Setup

Copy the Headstart log file out of the Docker container into this folder, in this case for the BASE API:

```bash
docker cp dev-base-1:/var/log/headstart/headstart.log ./headstart-before.log
```

After making your changes, collect a second log file, in this case for the BASE API:

```bash
docker cp dev-base-1:/var/log/headstart/headstart.log ./headstart-after.log
```

## Usage

```bash
python3 compare_logs.py headstart-before.log headstart-after.log
```

Both arguments are optional and default to `headstart-before.log` and `headstart-after.log`.

## Output

The script extracts all `Time taken:` log entries, groups them by source (`api.base`, `api.pubmed`, `api.openaire`, `vis`, `metrics`), and reports per group and overall:

- Count, Min, Median, Mean, Max
- Change in median and mean (absolute and percentage)
