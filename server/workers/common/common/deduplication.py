import re
import numpy as np
import pandas as pd
import Levenshtein
from rapidfuzz import fuzz
from urllib.parse import urlparse

pattern_doi = re.compile(r"\.v(\d)+$")

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

def find_duplicate_indexes(df):    
    dupind = df.id.map(lambda x: df[df.duplicates.str.contains(x)].index)
    tmp = pd.DataFrame(dupind).astype(str).drop_duplicates().index
    return dupind[tmp]

def mark_duplicate_dois(df):
    for doi, index in df.groupby("doi").groups.items():
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

def remove_textual_duplicates_from_different_sources(df, dupind):
    for _, idx in dupind.items():
        if len(idx) > 1:
            tmp = df.loc[idx]
            df.loc[tmp.index, "is_duplicate"] = True
            df.loc[tmp.index, "is_anchor"] = False
            publisher_dois = list(filter(None, tmp.publisher_doi.unique().tolist()))
            if len(publisher_dois) > 0:
                # keep entry with doi
                df.loc[tmp[tmp.publisher_doi!=""].index, "is_anchor"] = True
            else:
                df.loc[tmp.sort_values(["doi", "year"], ascending=[False, False]).head(1).index, "is_anchor"] = True
    return df

def mark_latest_doi(df, dupind):
    for _, idx in dupind.items():
        idx = df.index.intersection(idx)
        tmp = df.loc[idx]
        for udoi in list(filter(None, tmp.unversioned_doi.unique().tolist())):
            tmp2 = tmp[tmp.unversioned_doi == udoi]
            if len(tmp2) > 0:
                df.loc[tmp2.index, "is_anchor"] = False
                versions = tmp2.id
                latest = tmp2.sort_values("doi_version", ascending=False).head(1).id
                v = [{"versions": versions.values.tolist(), "latest": latest.values.tolist()}]*len(tmp2)
                df.loc[versions.index, "versions"] = v
                df.loc[latest.index, "is_anchor"] = True
    return df
    
def prioritize_OA_and_latest(df, dupind):
    for _, idx in dupind.items():
        idx = df.index.intersection(idx)
        if len(idx) > 1:
            tmp = df.loc[idx]
            df.loc[idx, "is_anchor"] = False
            if len(tmp[tmp.oa_state=="1"]) > 0:
                df.loc[tmp[tmp.oa_state=="1"].sort_values("year", ascending=False).head(1).index, "is_anchor"] = True
            else:
                df.loc[tmp.sort_values("year", ascending=False).head(1).index, "is_anchor"] = True
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

def prioritize_doi_and_provider(df, dupind):
    for _, idx in dupind.items():
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
            anchor_idx = highest_priority_candidates.index[0]
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

    for link in links:
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

    result = list(normalized_to_link.values()) + list(invalid_urls)
    return result