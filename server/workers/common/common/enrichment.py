import pandas as pd
from rapidfuzz import fuzz

STRATEGY_REPLACE = 'replace'
STRATEGY_MERGE = 'merge'

KEYWORD_SIMILARITY_THRESHOLD = 85

OA_STATE_PRIORITY = {
    "1": 0,  # yes
    "0": 1,  # no
    "2": 2,  # unknown
}

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
        - oa_state: replaced with the highest priority status (yes > no > unknown)

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
    has_oa_state = 'oa_state' in df.columns

    is_all_columns_are_missing = not has_subject_orig and not has_subject and not has_paper_abstract and not has_oa_state
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

        best_oa_state = None
        best_oa_state_priority = float('inf')

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

            if has_oa_state:
                oa_state_value = group_data.loc[element_idx, 'oa_state']
                is_not_empty = not pd.isna(oa_state_value)
                if is_not_empty:
                    oa_state_str = str(oa_state_value)
                    priority = OA_STATE_PRIORITY.get(oa_state_str, float('inf'))
                    if priority < best_oa_state_priority:
                        best_oa_state_priority = priority
                        best_oa_state = oa_state_value

        if has_subject_orig:
            if is_use_merge_strategy:
                if all_subject_orig_keywords:
                    unique_keywords = deduplicate_keywords(all_subject_orig_keywords)
                    merged_value = '; '.join(sorted(unique_keywords))
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
                    unique_keywords = deduplicate_keywords(all_subject_keywords)
                    merged_value = '; '.join(sorted(unique_keywords))
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

        is_better_oa_state_presented = best_oa_state is not None
        if is_better_oa_state_presented:
            current = df.loc[anchor_idx, 'oa_state']
            if pd.isna(current) or str(current) != str(best_oa_state):
                df.loc[anchor_idx, 'oa_state'] = best_oa_state

    return df

def deduplicate_keywords(keywords, similarity_threshold=KEYWORD_SIMILARITY_THRESHOLD):
    """
    Removes similar keywords from the list, leaving only unique.

    Uses RapidFuzz for fuzzy string comparison. If two keywords
    are similar more than threshold%, the longer variant is kept.

    Examples of duplicates that will be recognized:
        - "ME CFS", "ME/CFS", "ME-CFS"
        - "chronic fatigue", "Chronic Fatigue"

    Args:
        keywords: Set or list of keywords
        similarity_threshold: Threshold for similarity (0-100), above which words are considered duplicates

    Returns:
        List of unique keywords
    """
    if not keywords:
        return []

    keywords_list = list(keywords)
    unique_keywords = []

    for keyword in keywords_list:
        is_duplicate = False

        for i, existing in enumerate(unique_keywords):
            similarity = fuzz.token_sort_ratio(keyword.lower(), existing.lower())

            is_similar = similarity >= similarity_threshold
            if is_similar:
                is_duplicate = True
                if len(keyword) > len(existing):
                    unique_keywords[i] = keyword

        if not is_duplicate:
            unique_keywords.append(keyword)

    return unique_keywords