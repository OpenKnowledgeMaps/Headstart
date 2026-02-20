#!/usr/bin/env python3
"""Compare 'Time taken' entries between two ORCID worker log files."""

import re
import sys
import statistics
from collections import defaultdict

PATTERN = re.compile(
    r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} DEBUG\s+ORCID (\S+) Time taken: ([\d.]+)"
)


def parse_log(filepath):
    """Extract Time taken values grouped by ORCID ID."""
    groups = defaultdict(list)
    with open(filepath) as f:
        for line in f:
            m = PATTERN.match(line)
            if m:
                orcid_id = m.group(1)
                value = float(m.group(2))
                groups[orcid_id].append(value)
    return groups


def print_stats(label, values):
    """Print descriptive statistics for a list of values."""
    values_sorted = sorted(values)
    n = len(values_sorted)
    mean = statistics.mean(values_sorted)
    median = statistics.median(values_sorted)
    print(f"  {label}:")
    print(f"    Count:  {n}")
    print(f"    Min:    {values_sorted[0]:.3f}s")
    print(f"    Median: {median:.3f}s")
    print(f"    Mean:   {mean:.3f}s")
    print(f"    Max:    {values_sorted[-1]:.3f}s")
    return {"count": n, "min": values_sorted[0], "median": median, "mean": mean, "max": values_sorted[-1]}


def main():
    before_file = sys.argv[1] if len(sys.argv) > 1 else "orcid-before.log"
    after_file = sys.argv[2] if len(sys.argv) > 2 else "orcid-after.log"

    before = parse_log(before_file)
    after = parse_log(after_file)

    all_orcids = sorted(set(list(before.keys()) + list(after.keys())))

    before_all = []
    after_all = []
    for orcid in all_orcids:
        before_all.extend(before.get(orcid, []))
        after_all.extend(after.get(orcid, []))

    print("=" * 60)
    print("BEFORE vs AFTER comparison (ORCID worker)")
    print("=" * 60)

    # Per-ORCID stats
    for orcid in all_orcids:
        print(f"\n--- {orcid} ---")
        b_stats = a_stats = None
        if orcid in before:
            b_stats = print_stats("Before", before[orcid])
        else:
            print("  Before: (no data)")
        if orcid in after:
            a_stats = print_stats("After", after[orcid])
        else:
            print("  After: (no data)")

        if b_stats and a_stats:
            print(f"  Change in median: {a_stats['median'] - b_stats['median']:+.3f}s ({(a_stats['median'] / b_stats['median'] - 1) * 100:+.1f}%)")
            print(f"  Change in mean:   {a_stats['mean'] - b_stats['mean']:+.3f}s ({(a_stats['mean'] / b_stats['mean'] - 1) * 100:+.1f}%)")

    # Overall stats
    print(f"\n{'=' * 60}")
    print("ALL ORCID IDs COMBINED")
    print("=" * 60)
    b_total = a_total = None
    if before_all:
        b_total = print_stats("Before", before_all)
    else:
        print("  Before: (no data)")
    if after_all:
        a_total = print_stats("After", after_all)
    else:
        print("  After: (no data)")
    if b_total and a_total:
        print(f"  Change in median: {a_total['median'] - b_total['median']:+.3f}s ({(a_total['median'] / b_total['median'] - 1) * 100:+.1f}%)")
        print(f"  Change in mean:   {a_total['mean'] - b_total['mean']:+.3f}s ({(a_total['mean'] / b_total['mean'] - 1) * 100:+.1f}%)")


if __name__ == "__main__":
    main()
