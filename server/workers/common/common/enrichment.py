import os
import pandas as pd
from common.deduplication import deduplicate_keywords, deduplicate_links

ENRICHMENT_STRATEGY_FOR_SUBJECT = os.getenv("ENRICHMENT_STRATEGY_FOR_SUBJECT")

STRATEGY_REPLACE = 'replace'
STRATEGY_MERGE = 'merge'

KEYWORD_SIMILARITY_THRESHOLD = 85

OA_STATE_PRIORITY = {
    "1": 0,  # yes
    "0": 1,  # no
    "2": 2,  # unknown
}

def enrich_anchor_using_duplicates(df, dupind, subject_strategy=ENRICHMENT_STRATEGY_FOR_SUBJECT):
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
        - link: merged from all duplicates, duplicates links are removed (https > http)

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
    has_link = 'link' in df.columns

    is_all_columns_are_missing = not has_subject_orig and not has_subject and not has_paper_abstract and not has_oa_state and not has_link
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

        subject_orig_acc = {'all_keywords': set(), 'best_value': None, 'best_count': 0}
        subject_acc = {'all_keywords': set(), 'best_value': None, 'best_count': 0}
        paper_abstract_acc = {'best_value': None, 'best_length': 0}
        oa_state_acc = {'best_value': None, 'best_priority': float('inf')}
        all_links = set()

        for element_idx in idx:
            if has_subject_orig:
                subject_orig_value = group_data.loc[element_idx, 'subject_orig']
                process_subject_orig_element(subject_orig_value, subject_orig_acc, is_use_merge_strategy)

            if has_subject:
                subject_value = group_data.loc[element_idx, 'subject']
                process_subject_element(subject_value, subject_acc, is_use_merge_strategy)

            if has_paper_abstract:
                paper_abstract_value = group_data.loc[element_idx, 'paper_abstract']
                process_paper_abstract_element(paper_abstract_value, paper_abstract_acc)

            if has_oa_state:
                oa_state_value = group_data.loc[element_idx, 'oa_state']
                process_oa_state_element(oa_state_value, oa_state_acc)

            if has_link:
                link_value = group_data.loc[element_idx, 'link']
                process_link_element(link_value, all_links)

        if has_subject_orig:
            apply_subject_improvements(df, anchor_idx, subject_orig_acc, is_use_merge_strategy, 'subject_orig')

        if has_subject:
            apply_subject_improvements(df, anchor_idx, subject_acc, is_use_merge_strategy, 'subject')

        if has_paper_abstract:
            apply_paper_abstract_improvements(df, anchor_idx, paper_abstract_acc)

        if has_oa_state:
            apply_oa_state_improvements(df, anchor_idx, oa_state_acc)

        if has_link:
            apply_link_improvements(df, anchor_idx, all_links)

    return df

def process_subject_orig_element(value, accumulator, use_merge_strategy):
    """
    Processes the subject_orig value for one element of the group.

    Args:
        value: The subject_orig value from the element
        accumulator: Dictionary with accumulative data
        use_merge_strategy: If True, uses the merge strategy, otherwise replace
    """
    is_not_empty = not (pd.isna(value) or value == '')
    if not is_not_empty:
        return

    keywords = [kw.strip() for kw in str(value).split(';') if kw.strip()]
    if use_merge_strategy:
        accumulator['all_keywords'].update(keywords)
    else:
        keyword_count = len(keywords)
        if keyword_count > accumulator['best_count']:
            accumulator['best_count'] = keyword_count
            accumulator['best_value'] = value

def process_subject_element(value, accumulator, use_merge_strategy):
    """
    Processes the subject value for one element of the group.

    Args:
        value: The subject value from the element
        accumulator: Dictionary with accumulative data
        use_merge_strategy: If True, uses the merge strategy, otherwise replace
    """
    is_not_empty = not (pd.isna(value) or value == '')
    if not is_not_empty:
        return

    keywords = [kw.strip() for kw in str(value).split(';') if kw.strip()]
    if use_merge_strategy:
        accumulator['all_keywords'].update(keywords)
    else:
        keyword_count = len(keywords)
        if keyword_count > accumulator['best_count']:
            accumulator['best_count'] = keyword_count
            accumulator['best_value'] = value

def process_paper_abstract_element(value, accumulator):
    """
    Processes the paper_abstract value for one element of the group.

    Args:
        value: The paper_abstract value from the element
        accumulator: Dictionary with accumulative data
    """
    is_not_empty = not (pd.isna(value) or value == '')
    if not is_not_empty:
        return

    abstract_length = len(str(value))
    if abstract_length > accumulator['best_length']:
        accumulator['best_length'] = abstract_length
        accumulator['best_value'] = value

def process_oa_state_element(value, accumulator):
    """
    Processes the oa_state value for one element of the group.

    Args:
        value: The oa_state value from the element
        accumulator: Dictionary with accumulative data
    """
    is_not_empty = not pd.isna(value)
    if not is_not_empty:
        return

    oa_state_str = str(value)
    priority = OA_STATE_PRIORITY.get(oa_state_str, float('inf'))
    if priority < accumulator['best_priority']:
        accumulator['best_priority'] = priority
        accumulator['best_value'] = value

def process_link_element(value, accumulator):
    """
    Processes the link value for one element of the group.

    Args:
        value: The link value from the element
        accumulator: Set to collect all links
    """
    is_not_empty = not (pd.isna(value) or value == '')
    if not is_not_empty:
        return

    links = [link.strip() for link in str(value).split(';') if link.strip()]
    accumulator.update(links)

def apply_subject_improvements(df, anchor_idx, accumulator, use_merge_strategy, column_name):
    """
    Applies improvements for subject or subject_orig to the anchor element.

    Args:
        df: DataFrame with data
        anchor_idx: Index of the anchor element
        accumulator: Dictionary with accumulative data
        use_merge_strategy: If True, uses the merge strategy, otherwise replace
        column_name: Column name ('subject' or 'subject_orig')
    """
    if use_merge_strategy:
        if accumulator['all_keywords']:
            unique_keywords = deduplicate_keywords(accumulator['all_keywords'], KEYWORD_SIMILARITY_THRESHOLD)
            merged_value = '; '.join(sorted(unique_keywords))
            df.loc[anchor_idx, column_name] = merged_value
    else:
        if accumulator['best_value'] is not None:
            current = df.loc[anchor_idx, column_name]
            if pd.isna(current) or str(current) != str(accumulator['best_value']):
                df.loc[anchor_idx, column_name] = accumulator['best_value']

def apply_paper_abstract_improvements(df, anchor_idx, accumulator):
    """
    Applies improvements for paper_abstract to the anchor element.

    Args:
        df: DataFrame with data
        anchor_idx: Index of the anchor element
        accumulator: Dictionary with accumulative data
    """
    if accumulator['best_value'] is not None:
        current = df.loc[anchor_idx, 'paper_abstract']
        if pd.isna(current) or str(current) != str(accumulator['best_value']):
            df.loc[anchor_idx, 'paper_abstract'] = accumulator['best_value']

def apply_oa_state_improvements(df, anchor_idx, accumulator):
    """
    Applies improvements for oa_state to the anchor element.

    Args:
        df: DataFrame with data
        anchor_idx: Index of the anchor element
        accumulator: Dictionary with accumulative data
    """
    if accumulator['best_value'] is not None:
        current = df.loc[anchor_idx, 'oa_state']
        if pd.isna(current) or str(current) != str(accumulator['best_value']):
            df.loc[anchor_idx, 'oa_state'] = accumulator['best_value']

def apply_link_improvements(df, anchor_idx, all_links):
    """
    Applies improvements for link to the anchor element: set in
    pdf_link_candidates_from_duplicates column if there are any links
    from duplicates that can be used for PDF lookup.

    Args:
        df: DataFrame with data
        anchor_idx: Index of the anchor element
        all_links: Set of all collected links
    """
    if all_links:
        unique_links = deduplicate_links(all_links)
        if unique_links:
            anchor_link = get_anchor_field_value(df, anchor_idx, 'link')
            unique_links_without_anchor_link = [x for x in unique_links if x != anchor_link]

            merged_links = '; '.join(sorted(unique_links_without_anchor_link))
            df.loc[anchor_idx, 'pdf_link_candidates_from_duplicates'] = merged_links

def get_anchor_field_value(df, anchor_idx, column_name):
    """
    Returns the value of the given column for the anchor row, or None if
    the column is missing or the value is empty/NaN.
    """
    if column_name not in df.columns:
        return None
    value = df.loc[anchor_idx, column_name]
    if pd.isna(value) or value == '':
        return None
    return value
