import pandas as pd  # type: ignore[reportMissingImports]

def has_meaningful_value(row, column_name: str) -> bool:
    """
    Treat pandas NaN / None / '' / whitespace-only (e.g. '\\n\\n') as empty.
    """
    value = row[column_name]

    if pd.isna(value):
        return False

    return str(value).strip() != ""