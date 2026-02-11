import pandas as pd

def enrich_anchor_using_duplicates(df, dupind):
    """
    Enriches anchor elements using data from duplicates in their groups.

    The function finds anchor elements (is_anchor=True) in duplicate groups and improves
    their properties by copying the best values from duplicates in the group or merging
    initial values with values from duplicates.

    List of improvements:
        - subject_orig: replaced from a duplicate with the highest number of keywords

    Args:
        df: DataFrame with metadata, containing the column is_anchor
        dupind: Series with indices of duplicates for each id

    Returns:
        DataFrame with improved anchor properties
    """
    for _, idx in dupind.items():
        idx = df.index.intersection(idx)

        if len(idx) <= 1:
            continue

        group_data = df.loc[idx]

        anchor_mask = group_data.is_anchor == True
        anchors = group_data[anchor_mask]

        if len(anchors) > 0:
            anchor = anchors.iloc[0]
            anchor_idx = anchor.name

            df = replace_subjects(df, anchor_idx, idx)

    return df

def replace_subjects(df, anchor_idx, group_indices):
    """
    Replaces the subject_orig field of the anchor element with the best
    value from the group of duplicates by the number of keywords.
    Also updates the subject field for consistency.

    Finds the element with the highest number of keywords in the subject_orig field
    (keywords separated by ";") and replaces the subject_orig of the anchor element.
    Also updates the subject field for consistency.

    Args:
        df: DataFrame with metadata
        anchor_idx: Index of the anchor element in the DataFrame
        group_indices: Indices of all elements in the group (including the anchor)

    Returns:
        DataFrame with the updated subject_orig of the anchor element
    """
    group_data = df.loc[group_indices]

    if 'subject_orig' not in group_data.columns:
        return df

    best_subject_orig = None
    best_count = 0
    best_idx = None

    for idx in group_indices:
        subject_orig_value = group_data.loc[idx, 'subject_orig']

        is_empty = pd.isna(subject_orig_value) or subject_orig_value == ''
        if is_empty:
            continue

        keywords = [kw.strip() for kw in str(subject_orig_value).split(';') if kw.strip()]
        keyword_count = len(keywords)
        if keyword_count > best_count:
            best_count = keyword_count
            best_subject_orig = subject_orig_value
            best_idx = idx

    if best_subject_orig is not None and best_idx is not None:
        current_subject_orig_in_anchor = df.loc[anchor_idx, 'subject_orig']

        if pd.isna(current_subject_orig_in_anchor) or str(current_subject_orig_in_anchor) != str(best_subject_orig):
            df.loc[anchor_idx, 'subject_orig'] = best_subject_orig

            if 'subject' in df.columns:
                df.loc[anchor_idx, 'subject'] = best_subject_orig

    return df