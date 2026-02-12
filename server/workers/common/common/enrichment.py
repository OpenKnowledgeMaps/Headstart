import pandas as pd

STRATEGY_REPLACE = 'replace'
STRATEGY_MERGE = 'merge'

def enrich_anchor_using_duplicates(df, dupind, subject_strategy=STRATEGY_MERGE):
    """
    Enriches anchor elements using data from duplicates in their groups.

    The function finds anchor elements (is_anchor=True) in duplicate groups and improves
    their properties by copying the best values from duplicates in the group.
    All improvements are done in a single pass through the group for efficiency.

    List of improvements:
        - subject_orig: processed according to subject_strategy
        - subject: processed according to subject_strategy
        - paper_abstract: replaced with the longest description

    Args:
        df: DataFrame with metadata, containing the column is_anchor
        dupind: Series with indices of duplicates for each id
        subject_strategy: Strategy for processing keywords ('replace' or 'merge')
            - 'replace': select the value with the highest number of keywords
            - 'merge': combine all keywords from the group, removing duplicates

    Returns:
        DataFrame with improved anchor properties
    """
    has_subject_orig = 'subject_orig' in df.columns
    has_subject = 'subject' in df.columns
    has_paper_abstract = 'paper_abstract' in df.columns

    is_all_columns_are_missing = not has_subject_orig and not has_subject and not has_paper_abstract
    if is_all_columns_are_missing:
        return df

    is_use_merge_strategy = subject_strategy == STRATEGY_MERGE

    for _, idx in dupind.items():
        idx = df.index.intersection(idx)

        is_group_has_only_one_element = len(idx) <= 1
        if is_group_has_only_one_element:
            continue

        group_data = df.loc[idx]

        anchor_mask = group_data.is_anchor == True
        anchors = group_data[anchor_mask]

        is_no_anchors = len(anchors) == 0
        if is_no_anchors:
            continue

        anchor = anchors.iloc[0]
        anchor_idx = anchor.name

        all_subject_orig_keywords = set()
        all_subject_keywords = set()

        best_subject_orig = None
        best_subject_orig_count = 0
        best_subject = None
        best_subject_count = 0

        best_paper_abstract = None
        best_paper_abstract_length = 0

        for element_idx in idx:
            if has_subject_orig:
                subject_orig_value = group_data.loc[element_idx, 'subject_orig']
                is_not_empty = not (pd.isna(subject_orig_value) or subject_orig_value == '')
                if is_not_empty:
                    keywords = [kw.strip() for kw in str(subject_orig_value).split(';') if kw.strip()]
                    if is_use_merge_strategy:
                        all_subject_orig_keywords.update(keywords)
                    else:
                        keyword_count = len(keywords)
                        if keyword_count > best_subject_orig_count:
                            best_subject_orig_count = keyword_count
                            best_subject_orig = subject_orig_value

            if has_subject:
                subject_value = group_data.loc[element_idx, 'subject']
                is_not_empty = not (pd.isna(subject_value) or subject_value == '')
                if is_not_empty:
                    keywords = [kw.strip() for kw in str(subject_value).split(';') if kw.strip()]
                    if is_use_merge_strategy:
                        all_subject_keywords.update(keywords)
                    else:
                        keyword_count = len(keywords)
                        if keyword_count > best_subject_count:
                            best_subject_count = keyword_count
                            best_subject = subject_value

            if has_paper_abstract:
                paper_abstract_value = group_data.loc[element_idx, 'paper_abstract']
                is_not_empty = not (pd.isna(paper_abstract_value) or paper_abstract_value == '')
                if is_not_empty:
                    abstract_length = len(str(paper_abstract_value))
                    if abstract_length > best_paper_abstract_length:
                        best_paper_abstract_length = abstract_length
                        best_paper_abstract = paper_abstract_value

        if has_subject_orig:
            if is_use_merge_strategy:
                if all_subject_orig_keywords:
                    merged_value = '; '.join(sorted(all_subject_orig_keywords))
                    df.loc[anchor_idx, 'subject_orig'] = merged_value
            else:
                is_better_subject_orig_presented = best_subject_orig is not None
                if is_better_subject_orig_presented:
                    current = df.loc[anchor_idx, 'subject_orig']
                    if pd.isna(current) or str(current) != str(best_subject_orig):
                        df.loc[anchor_idx, 'subject_orig'] = best_subject_orig

        if has_subject:
            if is_use_merge_strategy:
                if all_subject_keywords:
                    merged_value = '; '.join(sorted(all_subject_keywords))
                    df.loc[anchor_idx, 'subject'] = merged_value
            else:
                is_better_subject_presented = best_subject is not None
                if is_better_subject_presented:
                    current = df.loc[anchor_idx, 'subject']
                    if pd.isna(current) or str(current) != str(best_subject):
                        df.loc[anchor_idx, 'subject'] = best_subject

        is_better_paper_abstract_presented = best_paper_abstract is not None
        if is_better_paper_abstract_presented:
            current = df.loc[anchor_idx, 'paper_abstract']
            if pd.isna(current) or str(current) != str(best_paper_abstract):
                df.loc[anchor_idx, 'paper_abstract'] = best_paper_abstract

    return df