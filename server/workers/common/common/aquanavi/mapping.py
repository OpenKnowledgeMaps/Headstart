import re
import sys
import hashlib
import pandas as pd

from pathlib import Path

CSV_PATH = "common/common/aquanavi/mesocosm_data_cleaned.csv"
CSV_PATH_WITH_TEST_DATA = "common/common/aquanavi/mesocosm_data_cleaned_with_test_cases.csv"
DEFAULT_DOCUMENT_TYPE = "physical object"
DEFAULT_RESULT_TYPE = ['Other/Unknown material']
REQUIRED_COLUMNS = [
    "Name",
    "Country",
    "Equipment",
    "Research Topics",
    "Specialist areas",
    "Primary interests",
    "Controlled Parameters",
    "Description of Facility",
    "Facility location(s) split",
    "Years of Mesocosm Experiments",
    "Photos of experiments/installations images",
]

def process_string_column(row, name):
    """
    Process the column name from DataFrame.

    Args:
        row (pandas.Series): String DataFrame.
        name (str): Name of a column that must be processed.

    Returns:
        str: The processed string (parts separated by commas, or the original string),
        or an empty string if the original value was empty.
    """
    value = row[name]

    if value:
        processed_string = str(value).strip()

        if "\n" in processed_string:
            parts = [part.strip() for part in processed_string.split("\n") if part.strip()]
            return ", ".join(parts)
        else:
            return processed_string
    else:
        return ""

def remove_trailing_dot(string):
    if string and string.endswith('.'):
        return string[:-1]
    return string

def get_latitude_longitude(row):
    coordinates_string = str(row["Facility location(s) split"]).strip()

    latitude, longitude = None, None

    if "," in coordinates_string:
        try:
            latitude, longitude = [x.strip() for x in coordinates_string.split(",", 1)]
            longitude = str(longitude).strip("[]'\" ")
            latitude = str(latitude).strip("[]'\" ")
        except Exception:
            latitude, longitude = None, None

    return [latitude, longitude]

def get_years_of_experiments(row):
    # Supported formats: yyyy - present; yyyy - yyyy; yyyy to present; since yyyy;
    # started yyyy / starting yyyy / operational since yyyy; yyyy-present;
    text = str(row["Years of Mesocosm Experiments"]).strip()
    if not text:
        return None, None

    text = text.lower().replace("-", "-").replace("—", "-").replace("-", "-")

    # yyyy - present
    match = re.search(r"(\d{4})\s*-\s*present", text)
    if match:
        return match.group(1), "present"

    # yyyy - yyyy
    match = re.search(r"(\d{4})\s*-\s*(\d{4})", text)
    if match:
        return match.group(1), match.group(2)

    # yyyy to present
    match = re.search(r"(\d{4})\s*to\s*present", text)
    if match:
        return match.group(1), "present"

    # since yyyy
    match = re.search(r"since\s*(\d{4})", text)
    if match:
        return match.group(1), "present"

    # started yyyy / starting yyyy / operational since yyyy
    match = re.search(r"(?:started|starting|operational since)\s*(\d{4})", text)
    if match:
        return match.group(1), "present"

    # yyyy-present
    match = re.search(r"(\d{4})-present", text)
    if match:
        return match.group(1), "present"

    return None, None

def get_coverage(row):
    latitude, longitude = get_latitude_longitude(row)
    start, end = get_years_of_experiments(row)

    coverage_parts = []
    coverage_parts.append(f"country={str(row['Country']).strip()}" if row["Country"] else "country= ")
    coverage_parts.append(f"east='{longitude}'" if longitude else "east=")
    coverage_parts.append(f"north='{latitude}'" if latitude else "north=")
    coverage_parts.append(f"start='{start}'" if start else "start=")
    coverage_parts.append(f"end='{end}'" if end else "end=")

    result = "; ".join(coverage_parts)
    return result

def get_abstract(row):
    count_of_not_available_parts = 0
    abstract_parts = []

    if (row['Description of Facility']):
        abstract_parts.append(f"Facility description: {remove_trailing_dot(str(row['Description of Facility']).strip())}")
    else:
        count_of_not_available_parts += 1
        abstract_parts.append("Facility description: not available")

    if (row['Equipment']):
        abstract_parts.append(f"Equipment: {remove_trailing_dot(str(row['Equipment']).strip())}")
    else:
        count_of_not_available_parts += 1
        abstract_parts.append("Equipment: not available")

    if (row['Controlled Parameters']):
        abstract_parts.append(f"Controlled Parameters: {remove_trailing_dot(str(row['Controlled Parameters']).strip())}")
    else:
        count_of_not_available_parts += 1
        abstract_parts.append("Controlled Parameters: not available")

    if (count_of_not_available_parts == 3):
        return ""

    return "; ".join(abstract_parts)

def get_keywords(row):
    keywords_parts = []

    # Adding the "Specialist areas"
    specialist_areas = process_string_column(row, "Specialist areas")
    specialist_areas_without_trailing_dot = remove_trailing_dot(specialist_areas)
    if specialist_areas_without_trailing_dot:
        keywords_parts.append(specialist_areas_without_trailing_dot)
    else:
        keywords_parts.append("not available")

    # Adding the "Primary interests"
    primary_interests = process_string_column(row, "Primary interests")
    primary_interests_without_trailing_dot = remove_trailing_dot(primary_interests)
    if primary_interests_without_trailing_dot:
        keywords_parts.append(f"Primary interests: {primary_interests_without_trailing_dot}")
    else:
        keywords_parts.append("Primary interests: not available")

    # Adding the "Research Topics"
    research_topics = process_string_column(row, "Research Topics")
    research_topics_without_trailing_dot = remove_trailing_dot(research_topics)
    if research_topics_without_trailing_dot:
        keywords_parts.append(f"Research topics: {research_topics_without_trailing_dot}")
    else:
        keywords_parts.append("Research topics: not available")

    return "; ".join(keywords_parts)

def get_id(row):
    """
    Creates a unique identifier based on URL and location.

    Args:
        row (pandas.Series): String DataFrame.

    Returns:
        str: Identifier for a specific record. The identifier consists of: url + location in hashed form.
    """
    URL_COLUMN_NAME = "url"
    LOCATION_COLUMN_NAME = "Facility location(s) split"

    url = str(row[URL_COLUMN_NAME]).strip() if row[URL_COLUMN_NAME] else ""
    location = str(row[LOCATION_COLUMN_NAME]).strip() if row[LOCATION_COLUMN_NAME] else ""
    combined_url_and_location = url + location

    hasher = hashlib.sha256()
    hasher.update(combined_url_and_location.encode('utf-8'))
    hashed_identifier = hasher.hexdigest()
    return hashed_identifier

def check_that_csv_file_exists(csv_path):
    if not csv_path.exists():
        sys.exit(f"CSV does not exists: {csv_path}.")

def check_that_required_rows_exists(df, csv_path):
    for col in REQUIRED_COLUMNS:
        if col not in df.columns:
            sys.exit(f"The '{col}' is missing in the {csv_path} file")

def map_sample_data():
    csv_path = Path(CSV_PATH)

    check_that_csv_file_exists(csv_path)

    df = pd.read_csv(csv_path).fillna("")

    check_that_required_rows_exists(df, CSV_PATH)

    result = []
    for _, row in df.iterrows():
        id = get_id(row)
        title = str(row["Name"]).strip() if row["Name"] else ""
        url = str(row["url"]).strip() if row["url"] else ""
        image = row["Photos of experiments/installations images"] if row["Photos of experiments/installations images"] else ""

        result.append({
            "id": id,
            "title": title,
            "identifier": id,
            "link": url,
            "type": DEFAULT_DOCUMENT_TYPE,
            "resulttype": DEFAULT_RESULT_TYPE,
            "authors": "",
            "year": "",
            "language": "",
            "oa_state": "",
            "published_in": "",
            "relation": image,
            "paper_abstract": get_abstract(row),
            "subject_orig": get_keywords(row),
            "coverage": get_coverage(row)
        })

    return { "documents": result }