import re
import numpy as np
import pandas as pd
import Levenshtein
from rapidfuzz import fuzz
from urllib.parse import urlparse

# Strips dataset version/file suffixes to obtain a base DOI for grouping:
# Please consider those content providers only as examples,
# as the same DOI versioning patterns may be used by other providers as well.
#   .v3  →  Figshare, UCT, Loughborough, SAGE, Monash  (10.1184/R1/6551801.v1)
#   v3   →  arxive, ICPSR                                       (10.3886/e115525v3)
#   .3   →  Mendeley Data                               (10.17632/675v9chxnt.2)
#   v3-104960  →  ICPSR file-level sub-record           (10.3886/e115525v3-104960)
# NOTE: the bare .N alternative is intentionally limited to 1-3 digits to avoid
# false positives on DOIs like 10.1594/pangaea.982329 where the numeric suffix
# is a record identifier, not a version number.
pattern_doi = re.compile(r"(?:\.?v|\.)([0-9]{1,3})(?:-\d+)?$")
# Version stripping for the DOI merge key: only the explicit v-forms. The bare
# .N alternative must not apply here: article-number suffixes in the same
# style (10.1016/j.physleta.2015.07.045) would collide distinct papers of one
# journal batch onto a single key. Costs the key the Mendeley-style bare-.N
# version merge; those still merge via the title pass + mark_latest_doi.
pattern_doi_version_only = re.compile(r"\.?v([0-9]{1,3})(?:-\d+)?$")
_pattern_punctuation = re.compile(r"[^\w\s]")
_DOI_TITLE_CUTOFF = 1/15.83*100  # ≈ 6.32 on rapidfuzz's 0–100 scale


def _normalize_title(title: str) -> str:
    return _pattern_punctuation.sub("", title.lower())


def doi_title_filter(anchor_title: str, candidate_title: str) -> bool:
    """Return False if anchor and candidate likely not refer to the same paper.

    Uses case-folded, punctuation-stripped ratio matching so that
    journal-name prefixes ("Journal Name / Paper Title" vs "Paper Title") and
    ALL-CAPS vs title-case variants both resolve correctly.
    Returns True only when the titles share so little text that they are
    almost certainly unrelated papers mis-indexed under the same DOI.
    """
    a = _normalize_title(anchor_title)
    c = _normalize_title(candidate_title)
    return fuzz.partial_ratio(a, c) <= 100 - _DOI_TITLE_CUTOFF


def find_version_in_doi(doi):
    m = pattern_doi.findall(doi)
    if m:
        return int(m[0])
    else:
        return None
    
def get_unversioned_doi(doi):
    doi = "/".join(doi.split("/")[3:6])
    return pattern_doi.sub("", doi)

def get_publisher_doi(doi):
    pdoi = re.findall(r"org/10\.(\d+)", doi)
    if len(pdoi) > 0:
        return pdoi[0]
    else:
        return ""

def find_duplicate_groups(df):
    duplicate_groups = df.id.map(lambda x: df[df.duplicates.str.contains(x)].index)
    tmp = pd.DataFrame(duplicate_groups).astype(str).drop_duplicates().index
    return duplicate_groups[tmp]


# --- DOI merge key -----------------------------------------------------------
# The deterministic grouping key: records sharing a normalized DOI are one
# duplicate group regardless of title or input order. The key coalesces the
# DOI-bearing fields (doi_merge and additional_dois carry the dcdoi-derived
# DOIs that the link-derived `doi` misses) and mirrors the normalization the
# ORCID worker applies downstream, lifted here so every consumer benefits.

_DOI_URL_PREFIX = re.compile(r"^https?://(dx\.)?doi\.org/", re.IGNORECASE)


def _doi_candidates(value):
    """DOI strings contained in a field value (list / ';'-joined str / NaN)."""
    if isinstance(value, list):
        parts = []
        for element in value:
            parts.extend(str(element).split(";"))
    elif value is None:
        return []
    else:
        try:
            if pd.isna(value):
                return []
        except (TypeError, ValueError):
            return []
        parts = str(value).split(";")
    return [p.strip() for p in parts if p.strip()]


def normalize_doi_key(raw):
    """Normalized grouping key for one DOI value: bare, lowercased, unversioned.

    Returns "" for empty values and for values that are not DOIs (the
    link-derived `doi` field can hold arbitrary URLs).
    """
    if not isinstance(raw, str) or not raw.strip():
        return ""
    bare = _DOI_URL_PREFIX.sub("", raw.strip())
    if not bare.lower().startswith("10."):
        return ""
    return pattern_doi_version_only.sub("", bare.lower())


def compute_doi_key(doi_merge, additional_dois, doi):
    """The record's primary DOI key: coalesce doi_merge -> additional_dois -> doi."""
    for value in (doi_merge, additional_dois, doi):
        for candidate in _doi_candidates(value):
            key = normalize_doi_key(candidate)
            if key:
                return key
    return ""


def add_doi_keys(df):
    """Adds the doi_key column; missing source columns contribute nothing."""
    def _get(row, col):
        return row[col] if col in row.index else None

    df["doi_key"] = df.apply(
        lambda row: compute_doi_key(_get(row, "doi_merge"),
                                    _get(row, "additional_dois"),
                                    _get(row, "doi")),
        axis=1,
    )
    return df


def extend_duplicates_with_doi_groups(df):
    """Folds DOI-key partners into the `duplicates` marking.

    Records sharing a doi_key become one duplicate group exactly like the
    upstream textual marking would have made them, so the whole existing
    pipeline (grouping, anchor selection, enrichment) applies unchanged.
    Member ids are appended in sorted order: the resulting marking is a
    function of record content, not of input row order.
    """
    if "doi_key" not in df.columns:
        return df
    for key, index in df.groupby("doi_key").groups.items():
        if key and len(index) > 1:
            member_ids = sorted(df.loc[index, "id"])
            for idx in index:
                existing = [p for p in str(df.at[idx, "duplicates"]).split(",") if p]
                merged = existing + [m for m in member_ids if m not in existing]
                df.at[idx, "duplicates"] = ",".join(merged)
    return df


def mark_duplicate_dois(df, column="doi"):
    for doi, index in df.groupby(column).groups.items():
        if doi:
            if len(index) > 1:
                df.loc[index, "doi_duplicate"] = True
    return df

def mark_duplicate_links(df):
    for link, index in df.groupby("link").groups.items():
        if link:
            if len(index) > 1:
                df.loc[index, "link_duplicate"] = True
    return df


def identify_relations(df):
    for udoi in df.unversioned_doi.unique():
        if udoi:
            tmp = df[df.identifier.str.contains(udoi, regex=False)]
            if len(tmp) > 1:
                relations = tmp.id
                r = pd.Series([relations.values.tolist()]*len(tmp), index=relations.index)
                df.loc[relations.index, "relations"] = r
                df.loc[relations.index, "has_relations"] = True
    return df

def remove_false_positives_doi(df):
    df.loc[df[(df.doi != "") & (df.is_duplicate) & (~df.doi_duplicate)].index, "is_duplicate"] = False
    return df

def remove_false_positives_link(df):
    df.loc[df[(df.link != "") & (df.is_duplicate) & (~df.link_duplicate)].index, "is_duplicate"] = False
    return df

def add_false_negatives(df):
    df.loc[df[(~df.is_duplicate) & (df.link_duplicate)].index, "is_duplicate"] = True
    df.loc[df[(~df.is_duplicate) & (df.doi_duplicate)].index, "is_duplicate"] = True
    return df

def _tie_break_norm(t):
    """Normalized title for tie-break comparison (case/punctuation/whitespace)."""
    if not isinstance(t, str):
        return ""
    return re.sub(r"\s+", " ", _normalize_title(t)).strip()


def _title_preference_keys(norms):
    """Sort keys implementing the title preference among tie-break candidates.

    Rule (decided 2026-08-21):
      1. Across titles with *different* beginnings, prefer the SHORTER one.
         Target case: journal-name prefixes: "Frontiers in Earth Science /
         Microplastic emission and socioeconomic data…" vs the bare
         "Microplastic emission and socioeconomic data…".
      2. Among titles where one is a lexicographic PREFIX of the other,
         prefer the LONGER one. Target case: truncated titles: "…A novel
         approach combining SO" (cut mid-word) vs the full "…combining SO2
         concentrations from satellite data…"; also missing subtitles.

    Implemented as a total order (a naive pairwise "shorter unless prefix"
    preference is intransitive and could cycle): each title is keyed by the
    shortest title in the candidate set that is a prefix of it (its "stem").
    Sorting by (stem length asc, stem, length desc, full title) makes rule 1
    decide between stems and rule 2 decide within a stem chain.

    This solution is SUB-OPTIMAL by construction: whatever direction is
    chosen, some real cases pick a false positive and keep noisy metadata:
      - Rule 1 wrongly prefers truncated or subtitle-less variants whenever
        normalization noise (punctuation, encoding, spacing) breaks the
        prefix relation, so the pair falls through to "shorter wins".
      - Rule 2 wrongly prefers titles with appended junk: venue/year
        suffixes ("…. GI_Forum 2018") or repository language tags
        ("… ; ENEngelskEnglish…"): over the clean shorter variant.
      - For variants with genuinely different wording (translations,
        bilingual repository titles, preprint renamed at publication —
        roughly half of the observed differing-title pairs), title length
        carries no signal at all and the choice is arbitrary.
      - Correction/erratum records ("Publisher Correction: X") sharing the
        DOI of X are distinct documents; no title heuristic repairs that.
    The rule only decides when OA state, provider, version and year all tie,
    so the impact is small; it optimizes the common observed patterns,
    not correctness in general.

    Empty titles are excluded as stems so a record without a title cannot
    chain every other title into "longer wins".
    """
    stems = []
    for t in norms:
        prefixes = [s for s in norms if s and t.startswith(s)]
        stems.append(min(prefixes, key=len) if prefixes else t)
    return (
        [len(s) for s in stems],          # rule 1: shorter stem first
        stems,                            # deterministic among equal lengths
        [-len(t) for t in norms],         # rule 2: longer within a stem chain
        list(norms),                      # stable final text key
    )


def select_anchor_index(candidates, by=None, ascending=None):
    """Index of the deterministic anchor among candidate rows.

    Sorts by the caller's priority columns, then by the content tie-break
    keys: the title preference (see _title_preference_keys), then id. This is
    a total order over record content, so no tie ever falls through to input
    row position (BASE response order is not stable between runs). NaNs sort
    last in the caller's columns, matching the head(1) semantics the call
    sites previously relied on.
    """
    by = list(by) if by else []
    ascending = list(ascending) if ascending is not None else [True] * len(by)
    if not by and "title" not in candidates.columns and "id" not in candidates.columns:
        return candidates.index[0]
    # Sort a positionally re-indexed copy: callers may index the frame by id,
    # which would make a sort on the "id" column ambiguous.
    positional = candidates.reset_index(drop=True)
    if "title" in positional.columns:
        norms = [_tie_break_norm(t) for t in positional["title"]]
        stem_len, stem, len_desc, norm = _title_preference_keys(norms)
        positional["_title_stem_len"] = stem_len
        positional["_title_stem"] = stem
        positional["_title_len_desc"] = len_desc
        positional["_title_norm"] = norm
        by += ["_title_stem_len", "_title_stem", "_title_len_desc", "_title_norm"]
        ascending += [True, True, True, True]
    if "id" in positional.columns and "id" not in by:
        by.append("id")
        ascending.append(True)
    winner_pos = positional.sort_values(by, ascending=ascending).index[0]
    return candidates.index[winner_pos]


def remove_textual_duplicates_from_different_sources(df, duplicate_groups):
    for _, idx in duplicate_groups.items():
        if len(idx) > 1:
            tmp = df.loc[idx]
            df.loc[tmp.index, "is_duplicate"] = True
            df.loc[tmp.index, "is_anchor"] = False
            publisher_dois = list(filter(None, tmp.publisher_doi.unique().tolist()))
            if len(publisher_dois) > 0:
                # keep entry with doi
                df.loc[tmp[tmp.publisher_doi!=""].index, "is_anchor"] = True
            else:
                df.loc[[select_anchor_index(tmp, ["doi", "year"], [False, False])], "is_anchor"] = True
    return df

def mark_latest_doi(df, duplicate_groups):
    for _, idx in duplicate_groups.items():
        idx = df.index.intersection(idx)
        tmp = df.loc[idx]
        for udoi in list(filter(None, tmp.unversioned_doi.unique().tolist())):
            tmp2 = tmp[tmp.unversioned_doi == udoi]
            if len(tmp2) > 0:
                df.loc[tmp2.index, "is_anchor"] = False
                versions = tmp2.id
                latest = tmp2.loc[[select_anchor_index(tmp2, ["doi_version"], [False])]].id
                v = [{"versions": versions.values.tolist(), "latest": latest.values.tolist()}]*len(tmp2)
                df.loc[versions.index, "versions"] = v
                df.loc[latest.index, "is_anchor"] = True
    return df
    
def prioritize_OA_and_latest(df, duplicate_groups):
    for _, idx in duplicate_groups.items():
        idx = df.index.intersection(idx)
        if len(idx) > 1:
            tmp = df.loc[idx]
            df.loc[idx, "is_anchor"] = False
            if len(tmp[tmp.oa_state=="1"]) > 0:
                df.loc[[select_anchor_index(tmp[tmp.oa_state=="1"], ["year"], [False])], "is_anchor"] = True
            else:
                df.loc[[select_anchor_index(tmp, ["year"], [False])], "is_anchor"] = True
    return df

def mark_duplicates(metadata):
    dt = deduplicate_titles(metadata, 0)
    duplicate_candidates = dt["duplicate_candidates"]
    metadata["is_duplicate"] = metadata["id"].map(lambda x: x in duplicate_candidates)

def deduplicate_titles(metadata, list_size=-1):
    duplicate_candidates = []

    metadata['oa_state'] = metadata['oa_state'].replace("2", 0)
    metadata = metadata.sort_values(by=['oa_state', 'subject', 'paper_abstract', 'authors', 'published_in'],
                                    ascending=[False, False, False, False, False])

    index = (metadata['title'].str.contains(" ") == False) | (metadata['title'].str.len() < 15)
    metadata.loc[index, 'title'] = metadata.loc[index, 'title'] + " " + metadata['authors']

    num_items = len(metadata)
    max_replacements = num_items - list_size if num_items > list_size else -1

    ids = metadata['id'].tolist()
    titles = metadata['title'].str.lower().tolist()
    count = 1

    # create a matrix with the Levenshtein distance between all titles
    # first create a dataframe with all pairwise titles in rows and columns
    

    lv_matrix = compute_lv_matrix(titles, num_items)
    length_matrix = metadata['title'].str.len().values
    n = len(length_matrix)
    str_matrix = np.tile(length_matrix, (n, 1))
    str_matrix_t = str_matrix.T
    str_max_matrix = np.maximum(str_matrix, str_matrix_t)
    lv_ratio_matrix = lv_matrix / str_max_matrix

    duplicates = lv_ratio_matrix < 1 / 15.83
    strict_duplicates = lv_ratio_matrix < 0.03
    tmp = strict_duplicates.copy()
    np.fill_diagonal(tmp, False)

    identified_duplicates = []
    for col in range(tmp.shape[1]):
        duplicate_ids = [str(ids[i]) for i in np.where(tmp[:, col])[0]]
        if len(duplicate_ids) > 0:
            identified_duplicates.append(",".join(duplicate_ids))
        else:
            identified_duplicates.append("")
        
    if len(identified_duplicates) > 0:            
        identified_duplicates_df = pd.DataFrame({'id': ids, 'duplicates': identified_duplicates})
    else:
        identified_duplicates_df = pd.DataFrame({'id': ids, 'duplicates': [""] * len(ids)})

    return {"duplicate_candidates": duplicate_candidates, "identified_duplicates": identified_duplicates_df}

def compute_lv_matrix(titles, n):
    distance_matrix = np.zeros((n, n))
    for i in range(n):
        for j in range(i + 1, n):  # Only compute upper triangle
            dist = Levenshtein.distance(titles[i], titles[j])
            distance_matrix[i, j] = dist
            distance_matrix[j, i] = dist  # Symmetric matrix
    return distance_matrix

def prioritize_doi_and_provider(df, duplicate_groups):
    for _, idx in duplicate_groups.items():
        idx = df.index.intersection(idx)

        if len(idx) <= 1:
            continue

        tmp = df.loc[idx].copy()

        has_doi_and_collection = (
            tmp.doi.notna() &
            (tmp.doi != "") &
            tmp.collection.notna() &
            (tmp.collection != "")
        )

        candidates = tmp[has_doi_and_collection]

        if len(candidates) == 0:
            continue

        candidates = candidates.copy()
        candidates["provider_priority"] = candidates.collection.map(get_provider_priority)

        max_priority = candidates["provider_priority"].max()
        highest_priority_candidates = candidates[candidates["provider_priority"] == max_priority]

        if len(highest_priority_candidates) > 0:
            anchor_idx = select_anchor_index(highest_priority_candidates)
            df.loc[anchor_idx, "is_anchor"] = True

            other_idx = idx.difference([anchor_idx])
            df.loc[other_idx, "is_anchor"] = False

    return df

def get_provider_priority(provider):
    is_provider_not_available = pd.isna(provider) or provider == ""
    if is_provider_not_available:
        return -1

    formatted_provider = str(provider).lower()

    if "ftdatacite" in formatted_provider:
        return 1
    elif "cr" in formatted_provider:
        return 2
    else:
        return 0

def deduplicate_keywords(keywords, similarity_threshold):
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

    # Sorted iteration: callers pass sets, whose iteration order is hash-seed
    # dependent. The similar-keyword fold below is order-sensitive (which of
    # two equal-length variants survives, chains of pairwise-similar terms),
    # so a fixed input order is required for a deterministic result.
    keywords_list = sorted(keywords)
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

def deduplicate_links(links):
    """
    Removes duplicates links from the list, considering the difference in protocols.

    If the same link appears with http and https, the https version is kept.
    Other duplicates are also removed.

    Args:
        links: List or set of links

    Returns:
        List of unique links (https versions are preferred)
    """
    if not links:
        return []

    normalized_to_link = {}
    invalid_urls = set()

    # Sorted iteration: callers pass sets, and a same-protocol collision on a
    # normalized URL keeps the first-seen variant: fix the order so the kept
    # variant is deterministic.
    for link in sorted(links, key=str):
        link_str = str(link).strip()
        if not link_str:
            continue

        try:
            parsed = urlparse(link_str)
            protocol = parsed.scheme.lower()

            if not protocol:
                if link_str.startswith('//'):
                    link_str = 'http:' + link_str
                    parsed = urlparse(link_str)
                    protocol = parsed.scheme.lower()
                else:
                    invalid_urls.add(link_str)
                    continue

            normalized = f"{parsed.netloc}{parsed.path}{parsed.params}{parsed.query}{parsed.fragment}"

            if normalized in normalized_to_link:
                existing_link = normalized_to_link[normalized]
                existing_protocol = urlparse(existing_link).scheme.lower()

                if protocol == 'https' and existing_protocol == 'http':
                    normalized_to_link[normalized] = link_str
                elif protocol == 'http' and existing_protocol == 'https':
                    continue
            else:
                normalized_to_link[normalized] = link_str
        except Exception:
            invalid_urls.add(link_str)

    result = list(normalized_to_link.values()) + sorted(invalid_urls)
    return result