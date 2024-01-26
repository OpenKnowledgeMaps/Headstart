import pandas as pd
import re
import numpy as np

# cr*:
def parse_crossref(published_in):
    pattern = r'^(.*?)( ; (volume (\w+(-\w+)?),?\s*)?(issue ([-\w\s]+([-/][\w\s]+)?),?\s*)?(page ([-,\.\w]+(-[-,\.\w]+)?),?\s*)?)?( ; ISSN (\d{4}-\d{3}[\d\w]( \d{4}-\d{3}[\d\w])?))?$'
    
    source = published_in
    volume = np.nan
    issue = np.nan
    page = np.nan
    issn = np.nan
    
    m = re.search(pattern, published_in, re.IGNORECASE)

    if (m):
        source = m.group(1)
        if (m.group(4) != None):
            volume = m.group(4)
        if (m.group(7) != None):
            issue = m.group(7)
        if (m.group(10) != None):
            page = m.group(10)
        if (m.group(13) != None):
            issn = m.group(13)
    
    return {
        "published_in": published_in,
        "source": source,
        "volume": volume,
        "issue": issue,
        "page": page,
        "issn": issn
    }

# ftccsdartic:
def parse_ftccsdartic(published_in):
    # Imperfect, but good enough for our purposes. E.g. if the year is missing (rare) or it's misplaced, then the volume, issue and page cannot be parsed.
    pattern = r'^((E?ISSN): (\d{4}-\d{3}[\dX])\s*;\s*)?((E?ISSN): (\d{4}-\d{3}[\dX])\s*;\s*)?([^;]*).*?(, [12]\d{3}(, (\d+)( \((\d+(\s*-\s*\d+)?)\))?)?(, pp?\.\s*e?(\d+(\s*-+\s*\d+)?))?).*$'
    
    source = np.nan
    volume = np.nan
    issue = np.nan
    page = np.nan
    issn = np.nan
    
    m = re.search(pattern, published_in, re.IGNORECASE)
    if (m):
        if (m.group(7) != None):
            source = m.group(7)
        if (m.group(10) != None):
            volume = m.group(10)
        if (m.group(12) != None):
            issue = m.group(12)
        if (m.group(15) != None):
            page = m.group(15)
        if (m.group(3) != None):
            issn = m.group(3)
        if (m.group(6) != None):
            if (issn == np.nan):
                issn = ""
            if (len(issn) > 0):
                issn = issn + " "
            issn = issn + m.group(6)
    
    return {
        "published_in": published_in,
        "source": source,
        "volume": volume,
        "issue": issue,
        "page": page,
        "issn": issn
    }

# ftdoajarticles:
def parse_ftdoajarticles(published_in):
    pattern = r'^(.*?)(,?\s*Vol (\d+))?(,?\s*Iss (\d+(-\d+)?))?(,\s*P?p e?(\d+(-\d+)?))? \(\d+\)$'
    
    source = np.nan
    volume = np.nan
    issue = np.nan
    page = np.nan
    issn = np.nan
    
    m = re.search(pattern, published_in, re.IGNORECASE)
    if (m):
        if (m.group(1) != None):
            source = m.group(1)
        if (m.group(3) != None):
            volume = m.group(3)
        if (m.group(5) != None):
            issue = m.group(5)
        if (m.group(8) != None):
            page = m.group(8)
    
    return {
        "published_in": published_in,
        "source": source,
        "volume": volume,
        "issue": issue,
        "page": page,
        "issn": issn
    }

def parse_ftzenodo(published_in):
    # ftzenodo:
    pattern = r'^(.*?) (\d+)(\s?\((\d+)\))? ?(\d+(\s?-\s?\d+)?)?\s*$'
    
    source = np.nan
    volume = np.nan
    issue = np.nan
    page = np.nan
    issn = np.nan
    
    m = re.search(pattern, published_in, re.IGNORECASE)
    if (m):
        if (m.group(1) != None):
            source = m.group(1)
        if (m.group(2) != None):
            volume = m.group(2)
        if (m.group(4) != None):
            issue = m.group(4)
        if (m.group(5) != None):
            page = m.group(5)
    
    return {
        "published_in": published_in,
        "source": source,
        "volume": volume,
        "issue": issue,
        "page": page,
        "issn": issn
    }


def improved_df_parsing(df):
    published_ins = []
    sources = []
    volumes = []
    issues = []
    pages = []
    issns = []
    
    for index, row in df.iterrows():
        vals = {
            "published_in": row.published_in,
            "source": np.nan,
            "volume": np.nan,
            "issue": np.nan,
            "page": np.nan,
            "issn": np.nan
        }
        
        if (row.repo.startswith("cr")):
            vals = parse_crossref(row.published_in)
        elif (row.repo == "ftccsdartic"):
            vals = parse_ftccsdartic(row.published_in)
        elif (row.repo == "ftdoajarticles"):
            vals = parse_ftdoajarticles(row.published_in)
        elif (row.repo == "ftzenodo"):
            vals = parse_ftzenodo(row.published_in)
            
        published_ins.append(vals["published_in"])
        sources.append(vals["source"])
        volumes.append(vals["volume"])
        issues.append(vals["issue"])
        pages.append(vals["page"])
        issns.append(vals["issn"])
        
    d = {
        "source": sources,
        "volume": volumes,
        "issue": issues,
        "page": pages,
        "issn": issns
    }
    parsed_data = pd.DataFrame(data = d)
    
    return parsed_data