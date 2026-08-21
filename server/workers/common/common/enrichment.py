import os
import re
import logging
import pandas as pd
from common.deduplication import (
    deduplicate_keywords,
    deduplicate_links,
    select_anchor_index,
)

logger = logging.getLogger(__name__)

KEYWORD_SIMILARITY_THRESHOLD = 85

OA_STATE_PRIORITY = {
    "1": 0,  # yes
    "0": 1,  # no
    "2": 2,  # unknown
}

def _log_anchor_state(tag, df, anchor_idx, group_data=None):
    """
    Logs DOI, title, and keywords for an anchor record and, optionally, all
    members of its duplicate group.  Use tag='BEFORE'/'AFTER' for the anchor
    state and tag='GROUP' to dump every group member.

    All messages share the prefix [ANCHOR_ENRICHMENT] so they can be extracted
    with:  grep 'ANCHOR_ENRICHMENT' <logfile>
    """
    doi   = df.loc[anchor_idx, 'doi']       if 'doi'       in df.columns else 'N/A'
    title = df.loc[anchor_idx, 'title']    if 'title'    in df.columns else 'N/A'
    kw    = df.loc[anchor_idx, 'subject_orig']  if 'subject_orig'  in df.columns else 'N/A'
    resulttype = df.loc[anchor_idx, 'resulttype'] if 'resulttype' in df.columns else 'N/A'
    oa_state = df.loc[anchor_idx, 'oa_state'] if 'oa_state' in df.columns else 'N/A'
    link = df.loc[anchor_idx, 'link'] if 'link' in df.columns else 'N/A'

    logger.debug(
        "[ANCHOR_ENRICHMENT] anchor_%s doi=%s | title=%s | keywords=%s | resulttype=%s | oa_state=%r (type=%s) | link=%s",
        tag, doi, title, kw, resulttype, oa_state, type(oa_state).__name__, link
    )

    if group_data is not None:
        for _, member in group_data.iterrows():
            m_doi   = member.get('doi',      'N/A')
            m_title = member.get('title',   'N/A')
            m_kw    = member.get('subject_orig', 'N/A')
            m_resulttype = member.get('resulttype', 'N/A')
            m_oa_state = member.get('oa_state', 'N/A')
            m_link = member.get('link', 'N/A')
            is_anch = getattr(member, 'is_anchor', False)
            logger.debug(
                "[ANCHOR_ENRICHMENT] group_member is_anchor=%s doi=%s | title=%s | keywords=%s | resulttype=%s | oa_state=%r (type=%s) | link=%s",
                is_anch, m_doi, m_title, m_kw, m_resulttype, m_oa_state, type(m_oa_state).__name__, m_link
            )


def enrich_anchor_using_duplicates(df, duplicate_groups):
    """
    Enriches anchor elements using data from duplicates in their groups.

    The function finds anchor elements (is_anchor=True) in duplicate groups and improves
    their properties by copying the best values from duplicates in the group.
    All improvements are done in a single pass through the group for efficiency.

    List of improvements:
        - subject_orig: processed according to merge strategy (merge all keywords from duplicates, remove duplicates, sort alphabetically)
        - subject: processed according to merge strategy (merge all keywords from duplicates, remove duplicates, sort alphabetically)
        - paper_abstract: replaced with the longest description
        - oa_state: replaced with the highest priority status (yes > no > unknown)
        - link: merged from all duplicates, duplicates links are removed (https > http)

    Args:
        df: DataFrame with metadata, containing the column is_anchor
        duplicate_groups: Series with indices of duplicates for each id

    Returns:
        DataFrame with improved anchor properties
    """
    has_subject_orig = 'subject_orig' in df.columns
    has_subject = 'subject' in df.columns
    has_paper_abstract = 'paper_abstract' in df.columns
    has_oa_state = 'oa_state' in df.columns
    has_link = 'link' in df.columns
    has_additional_dois = 'additional_dois' in df.columns
    has_doi = 'doi' in df.columns
    has_mesh_specific = 'keywords_rank_mesh_specific' in df.columns
    has_mesh_generic = 'keywords_rank_mesh_generic' in df.columns

    is_all_columns_are_missing = (not has_subject_orig and not has_subject and not has_paper_abstract
                                  and not has_oa_state and not has_link and not has_additional_dois)
    if is_all_columns_are_missing:
        return df

    for _, idx in duplicate_groups.items():
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

        # A group can carry several anchors (e.g. the publisher-DOI branch marks
        # every DOI-bearing member); pick the one to enrich by the content
        # total order, not by row position.
        anchor = anchors.loc[select_anchor_index(anchors)]
        anchor_idx = anchor.name

        # _log_anchor_state('BEFORE', df, anchor_idx, group_data=group_data)

        subject_orig_acc = {'all_keywords': set(), 'best_value': None, 'best_count': 0}
        subject_acc = {'all_keywords': set(), 'best_value': None, 'best_count': 0}
        paper_abstract_acc = {'best_value': None, 'best_length': 0}
        oa_state_acc = {'best_value': None, 'best_priority': float('inf')}
        all_links = set()
        additional_dois_acc = {}
        mesh_specific_acc = {'all_keywords': set(), 'best_value': None, 'best_count': 0}
        mesh_generic_acc = {'all_keywords': set(), 'best_value': None, 'best_count': 0}

        for element_idx in idx:
            if has_subject_orig:
                subject_orig_value = group_data.loc[element_idx, 'subject_orig']
                process_subject_orig_element(subject_orig_value, subject_orig_acc)

            if has_subject:
                subject_value = group_data.loc[element_idx, 'subject']
                process_subject_element(subject_value, subject_acc)

            if has_paper_abstract:
                paper_abstract_value = group_data.loc[element_idx, 'paper_abstract']
                process_paper_abstract_element(paper_abstract_value, paper_abstract_acc)

            if has_oa_state:
                oa_state_value = group_data.loc[element_idx, 'oa_state']
                process_oa_state_element(oa_state_value, oa_state_acc)

            if has_link:
                link_value = group_data.loc[element_idx, 'link']
                process_link_element(link_value, all_links)

            if has_additional_dois or has_doi:
                doi_value = group_data.loc[element_idx, 'doi'] if has_doi else None
                additional_dois_value = group_data.loc[element_idx, 'additional_dois'] if has_additional_dois else None
                process_additional_dois_element(doi_value, additional_dois_value, additional_dois_acc)

            # MeSH rank columns (ranking Modes 2/3): merge them exactly like subject_orig,
            # so a duplicate carrying MeSH is not lost when its subject_orig is absorbed
            # into the anchor. Without this the anchor gets [MeSH]-marked subject_orig but
            # EMPTY MeSH columns, and Modes 2/3 silently degrade to Mode 1.
            if has_mesh_specific:
                process_subject_element(group_data.loc[element_idx, 'keywords_rank_mesh_specific'], mesh_specific_acc)
            if has_mesh_generic:
                process_subject_element(group_data.loc[element_idx, 'keywords_rank_mesh_generic'], mesh_generic_acc)

        if has_subject_orig:
            apply_subject_improvements(df, anchor_idx, subject_orig_acc, 'subject_orig')

        if has_subject:
            apply_subject_improvements(df, anchor_idx, subject_acc, 'subject')

        if has_paper_abstract:
            apply_paper_abstract_improvements(df, anchor_idx, paper_abstract_acc)

        if has_oa_state:
            apply_oa_state_improvements(df, anchor_idx, oa_state_acc)

        if has_link:
            apply_link_improvements(df, anchor_idx, all_links)

        if has_additional_dois:
            apply_additional_dois_improvements(df, anchor_idx, additional_dois_acc)

        if has_mesh_specific:
            apply_subject_improvements(df, anchor_idx, mesh_specific_acc, 'keywords_rank_mesh_specific')
        if has_mesh_generic:
            apply_subject_improvements(df, anchor_idx, mesh_generic_acc, 'keywords_rank_mesh_generic')

        # _log_anchor_state('AFTER', df, anchor_idx)

    return df

def process_subject_orig_element(value, accumulator):
    """
    Processes the subject_orig value for one element of the group.

    Args:
        value: The subject_orig value from the element
        accumulator: Dictionary with accumulative data
    """
    is_not_empty = not (pd.isna(value) or value == '')
    if not is_not_empty:
        return

    keywords = [kw.strip() for kw in str(value).split(';') if kw.strip()]
    accumulator['all_keywords'].update(keywords)

def process_subject_element(value, accumulator):
    """
    Processes the subject value for one element of the group.

    Args:
        value: The subject value from the element
        accumulator: Dictionary with accumulative data
    """
    is_not_empty = not (pd.isna(value) or value == '')
    if not is_not_empty:
        return

    keywords = [kw.strip() for kw in str(value).split(';') if kw.strip()]
    accumulator['all_keywords'].update(keywords)

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
    elif (abstract_length == accumulator['best_length']
            and accumulator['best_value'] is not None
            and str(value) < str(accumulator['best_value'])):
        # Equal-length tie: break on the text itself so the winner does not
        # depend on member iteration order.
        accumulator['best_value'] = value

def oa_state_priority(value):
    """
    Maps an oa_state value to its merge priority (lower wins: 1 yes > 0 no > 2 unknown).

    Accepts the canonical "0"/"1"/"2" strings produced by BASE as well as the int/float
    forms seen after other workers cast oa_state (orcid -> int) or pandas upcasts it to
    float on a left-join that introduced NaN (1 -> 1.0). NaN and unknown values map to
    +inf so they never displace a known state.
    """
    if pd.isna(value):
        return float('inf')

    if isinstance(value, float) and value.is_integer():
        key = str(int(value))
    else:
        key = str(value)

    return OA_STATE_PRIORITY.get(key, float('inf'))

def process_oa_state_element(value, accumulator):
    """
    Processes the oa_state value for one element of the group.

    Args:
        value: The oa_state value from the element
        accumulator: Dictionary with accumulative data
    """
    priority = oa_state_priority(value)
    if priority < accumulator['best_priority']:
        accumulator['best_priority'] = priority
        accumulator['best_value'] = value
    elif (priority == accumulator['best_priority']
            and accumulator['best_value'] is not None
            and str(value) < str(accumulator['best_value'])):
        # Equal priority can still mean different representations of the same
        # state (e.g. "1" vs 1.0 after a numeric cast); keep a deterministic one.
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

_DOI_PREFIX_RE = re.compile(r'^https?://(dx\.)?doi\.org/', re.IGNORECASE)

def process_additional_dois_element(doi_value, additional_dois_value, accumulator):
    """
    Collects every DOI a group member represents: its primary ``doi`` and any
    entries in ``additional_dois``: into the accumulator, so the anchor can later
    advertise all of them. Mirrors process_link_element, but for DOIs.

    Duplicate group members are dropped after enrichment, so unless their DOIs are
    folded into the anchor's additional_dois here, those DOIs become unmatchable
    downstream (e.g. the ORCID worker's explode-and-merge on doi_merge).

    ``additional_dois`` follows the base.R contract: a one-element list whose single
    element is a "; "-joined string of DOIs (see normalize_dois). The accumulator is a
    dict mapping a lower-cased bare DOI (dedup key) to its bare display form.

    Args:
        doi_value: The member's primary ``doi`` value (may be NaN/empty).
        additional_dois_value: The member's ``additional_dois`` value (list/str/NaN).
        accumulator: Dict collecting {lowercased_bare_doi: bare_doi}.
    """
    def add_raw(raw):
        if isinstance(raw, list):
            parts = []
            for element in raw:
                parts.extend(str(element).split(';'))
        elif raw is None or (pd.isna(raw) or raw == ''):
            return
        else:
            parts = str(raw).split(';')

        for part in parts:
            bare = _DOI_PREFIX_RE.sub('', part.strip())
            if bare:
                # Case variants share a key; keep the lexicographically
                # smaller display form so the choice is order-independent.
                key = bare.lower()
                existing = accumulator.get(key)
                if existing is None or bare < existing:
                    accumulator[key] = bare

    add_raw(doi_value)
    add_raw(additional_dois_value)

def apply_additional_dois_improvements(df, anchor_idx, accumulator):
    """
    Writes the union of all group-member DOIs into the anchor's ``additional_dois``,
    preserving the base.R contract (a one-element list holding a "; "-joined string of
    ``https://doi.org/``-prefixed DOIs) so downstream explode/merge can match every DOI
    the duplicate group represented back to this anchor.

    Args:
        df: DataFrame with data
        anchor_idx: Index of the anchor element
        accumulator: Dict of {lowercased_bare_doi: bare_doi}
    """
    if not accumulator:
        return

    merged = '; '.join('https://doi.org/' + bare for bare in sorted(accumulator.values()))
    df.at[anchor_idx, 'additional_dois'] = [merged]

    anchor_doi = df.loc[anchor_idx, 'doi'] if 'doi' in df.columns else 'N/A'
    anchor_title = df.loc[anchor_idx, 'title'] if 'title' in df.columns else 'N/A'
    # logger.debug(
    #     "[ENRICHMENT_APPLIED] additional_dois doi=%s | title=%s | additional_dois=%s",
    #     anchor_doi, anchor_title, merged
    # )

def apply_subject_improvements(df, anchor_idx, accumulator, column_name):
    """
    Applies improvements for subject or subject_orig to the anchor element.

    Args:
        df: DataFrame with data
        anchor_idx: Index of the anchor element
        accumulator: Dictionary with accumulative data
        column_name: Column name ('subject' or 'subject_orig')
    """
    if accumulator['all_keywords']:
        unique_keywords = deduplicate_keywords(accumulator['all_keywords'], KEYWORD_SIMILARITY_THRESHOLD)
        merged_value = '; '.join(sorted(unique_keywords))
        df.loc[anchor_idx, column_name] = merged_value

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

            if merged_links:
                anchor_doi = df.loc[anchor_idx, 'doi'] if 'doi' in df.columns else 'N/A'
                anchor_title = df.loc[anchor_idx, 'title'] if 'title' in df.columns else 'N/A'
                # logger.debug(
                #     "[ENRICHMENT_APPLIED] link doi=%s | title=%s | anchor_link=%s | candidates_from_duplicates=%s",
                #     anchor_doi, anchor_title, anchor_link, merged_links
                # )

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
