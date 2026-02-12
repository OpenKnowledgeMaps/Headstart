import pandas as pd

def enrich_anchor_using_duplicates(df, dupind):
    """
    Enriches anchor elements using data from duplicates in their groups.

    The function finds anchor elements (is_anchor=True) in duplicate groups and improves
    their properties by copying the best values from duplicates in the group or merging
    initial values with values from duplicates.

    List of improvements:
        - subject_orig: replaced from a duplicate with the highest number of keywords
        - paper_abstract: replaced from a duplicate with the longest description

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
            df = replace_paper_abstract(df, anchor_idx, idx)

    return df

def replace_subjects(df, anchor_idx, group_indices):
    """
    Replaces subject_orig and subject fields of the anchor element with the best
    values from the group of duplicates by the number of keywords.

    Finds the element with the highest number of keywords in each field
    (keywords separated by ";") and replaces the corresponding field of the anchor element.
    Each field is searched independently to find the best value.

    Args:
        df: DataFrame with metadata
        anchor_idx: Index of the anchor element in the DataFrame
        group_indices: Indices of all elements in the group (including the anchor)

    Returns:
        DataFrame with the updated subject_orig and subject of the anchor element
    """
    group_data = df.loc[group_indices]

    has_subject_orig = 'subject_orig' in group_data.columns
    has_subject = 'subject' in group_data.columns

    if not has_subject_orig and not has_subject:
        return df

    best_subject_orig = None
    best_subject_orig_count = 0
    best_subject = None
    best_subject_count = 0

    for idx in group_indices:
        if has_subject_orig:
            subject_orig_value = group_data.loc[idx, 'subject_orig']
            if not (pd.isna(subject_orig_value) or subject_orig_value == ''):
                keywords = [kw.strip() for kw in str(subject_orig_value).split(';') if kw.strip()]
                keyword_count = len(keywords)
                if keyword_count > best_subject_orig_count:
                    best_subject_orig_count = keyword_count
                    best_subject_orig = subject_orig_value

        if has_subject:
            subject_value = group_data.loc[idx, 'subject']
            if not (pd.isna(subject_value) or subject_value == ''):
                keywords = [kw.strip() for kw in str(subject_value).split(';') if kw.strip()]
                keyword_count = len(keywords)
                if keyword_count > best_subject_count:
                    best_subject_count = keyword_count
                    best_subject = subject_value

    is_best_subject_orig = best_subject_orig is not None
    if is_best_subject_orig:
        current_subject_orig = df.loc[anchor_idx, 'subject_orig']
        if pd.isna(current_subject_orig) or str(current_subject_orig) != str(best_subject_orig):
            df.loc[anchor_idx, 'subject_orig'] = best_subject_orig

    is_best_subject = best_subject is not None
    if is_best_subject:
        current_subject = df.loc[anchor_idx, 'subject']
        if pd.isna(current_subject) or str(current_subject) != str(best_subject):
            df.loc[anchor_idx, 'subject'] = best_subject

    return df

def replace_paper_abstract(df, anchor_idx, group_indices):
    """
    Replaces the paper_abstract field of the anchor element with
    the best value from the group of duplicates.

    Finds the element with the longest description in the paper_abstract field
    and replaces the paper_abstract of the anchor element with this variant.

    Args:
        df: DataFrame with metadata
        anchor_idx: Index of the anchor element in the DataFrame
        group_indices: Indices of all elements in the group (including the anchor)

    Returns:
        DataFrame with the updated paper_abstract of the anchor element
    """
    group_data = df.loc[group_indices]

    if 'paper_abstract' not in group_data.columns:
        return df

    best_paper_abstract = None
    best_length = 0

    for idx in group_indices:
        paper_abstract_value = group_data.loc[idx, 'paper_abstract']

        if pd.isna(paper_abstract_value) or paper_abstract_value == '':
            continue

        paper_abstract_str = str(paper_abstract_value)
        abstract_length = len(paper_abstract_str)

        if abstract_length > best_length:
            best_length = abstract_length
            best_paper_abstract = paper_abstract_value

    if best_paper_abstract is not None:
        current_paper_abstract_in_anchor = df.loc[anchor_idx, 'paper_abstract']

        if pd.isna(current_paper_abstract_in_anchor) or str(current_paper_abstract_in_anchor) != str(best_paper_abstract):
            df.loc[anchor_idx, 'paper_abstract'] = best_paper_abstract

    return df