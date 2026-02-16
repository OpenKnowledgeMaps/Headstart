#!/usr/bin/env python3
"""Compare 'Time taken' entries between two Headstart log files."""

import re
import sys
import statistics
from collections import defaultdict

PATTERN = re.compile(
    r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} INFO:(\S+):vis_id: \S+ Time taken: ([\d.]+)"
)


def parse_log(filepath):
    """Extract Time taken values grouped by log source."""
    groups = defaultdict(list)
    with open(filepath) as f:
        for line in f:
            m = PATTERN.match(line)
            if m:
                source = m.group(1)
                value = float(m.group(2))
                groups[source].append(value)
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
    before_file = sys.argv[1] if len(sys.argv) > 1 else "headstart-before.log"
    after_file = sys.argv[2] if len(sys.argv) > 2 else "headstart-after.log"

    before = parse_log(before_file)
    after = parse_log(after_file)

    all_sources = sorted(set(list(before.keys()) + list(after.keys())))

    # Also compute totals across all sources
    before_all = []
    after_all = []
    for src in all_sources:
        before_all.extend(before.get(src, []))
        after_all.extend(after.get(src, []))

    print("=" * 60)
    print("BEFORE vs AFTER comparison")
    print("=" * 60)

    # Per-source stats
    for src in all_sources:
        print(f"\n--- {src} ---")
        b_stats = a_stats = None
        if src in before:
            b_stats = print_stats("Before", before[src])
        else:
            print("  Before: (no data)")
        if src in after:
            a_stats = print_stats("After", after[src])
        else:
            print("  After: (no data)")

        if b_stats and a_stats:
            print(f"  Change in median: {a_stats['median'] - b_stats['median']:+.3f}s ({(a_stats['median'] / b_stats['median'] - 1) * 100:+.1f}%)")
            print(f"  Change in mean:   {a_stats['mean'] - b_stats['mean']:+.3f}s ({(a_stats['mean'] / b_stats['mean'] - 1) * 100:+.1f}%)")

    # Overall stats
    print(f"\n{'=' * 60}")
    print("ALL SOURCES COMBINED")
    print("=" * 60)
    if before_all:
        b_total = print_stats("Before", before_all)
    if after_all:
        a_total = print_stats("After", after_all)
    if before_all and after_all:
        print(f"  Change in median: {a_total['median'] - b_total['median']:+.3f}s ({(a_total['median'] / b_total['median'] - 1) * 100:+.1f}%)")
        print(f"  Change in mean:   {a_total['mean'] - b_total['mean']:+.3f}s ({(a_total['mean'] / b_total['mean'] - 1) * 100:+.1f}%)")


if __name__ == "__main__":
    main()
