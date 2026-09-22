# Log Performance Comparison

Compare "Time taken" statistics between two Headstart log files (e.g. before and after a change).

## Setup

Copy the Headstart log file out of the Docker container into this folder, in this case for the ORCID API:

```bash
docker cp dev-orcid-1:/var/log/headstart/headstart.log ./orcid-before.log
```

After making your changes, collect a second log file, in this case for the ORCID API:

```bash
docker cp dev-orcid-1:/var/log/headstart/headstart.log ./orcid-after.log
```

## Usage

```bash
python3 compare_orcid_logs.py orcid-before.log orcid-after.log
```

Both arguments are optional and default to `orcid-before.log` and `orcid-after.log`.

## Output

The script extracts all `Time taken:` log entries and reports descriptive statistics:

- Count, Min, Median, Mean, Max
- Change in median and mean (absolute and percentage)
