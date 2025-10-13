import re
import sys
import hashlib
import pandas as pd

from pathlib import Path

CSV_PATH = "common/common/aquanavi/mesocosm_data_cleaned.csv"
CSV_PATH_WITH_TEST_DATA = "common/common/aquanavi/mesocosm_data_cleaned_with_test_cases.csv"
DEFAULT_DOCUMENT_TYPE = "physical object"
DEFAULT_RESULT_TYPE = ['Other/Unknown material']
COLUMNS = {
    "url": "url",
    "name": "Name",
    "country": "Country",
    "continent": "Continent",
    "equipment": "Equipment",
    "research_topics": "Research Topics",
    "specialist_areas": "Specialist areas",
    "primary_interests": "Primary interests",
    "controlled_parameters": "Controlled Parameters",
    "description": "Description of Facility",
    "location": "Facility location(s) split",
    "years_of_experiments": "Years of Mesocosm Experiments",
    "photos_of_experiments": "Photos of experiments/installations images",
}

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
    coordinates_string = str(row[COLUMNS['location']]).strip()

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
    text = str(row[COLUMNS['years_of_experiments']]).strip()
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
    """
    Creates a coverage field information for each data entry. The coverage field contains
    string value in format as presented in the line below:
    "country=France; continent=Europe; east=-0.618181; north=44.776596 ; start=2010-07; end=2012-06"

    Args:
        row (pandas.Series): String DataFrame.

    Returns:
        str: String in the coverage field format.
    """
    latitude, longitude = get_latitude_longitude(row)
    start, end = get_years_of_experiments(row)

    coverage_parts = []
    coverage_parts.append(f"country={str(row[COLUMNS['country']]).strip()}" if row[COLUMNS['country']] else "country= ")
    coverage_parts.append(f"continent={str(row[COLUMNS['continent']]).strip()}" if row[COLUMNS['continent']] else "continent= ")
    coverage_parts.append(f"east='{longitude}'" if longitude else "east=")
    coverage_parts.append(f"north='{latitude}'" if latitude else "north=")
    coverage_parts.append(f"start='{start}'" if start else "start=")
    coverage_parts.append(f"end='{end}'" if end else "end=")

    result = "; ".join(coverage_parts)
    return result

def get_abstract(row):
    """
    Creates the abstract field for each data entry. The abstract field contains
    string value with data from such set of columns: Facility description, Equipment,
    Controlled Parameters, Primary interests and Research topics. If no column contains information,
    an empty string is returned. If the column does not contain any information, it will be added
    in the string as follows: "Equipment: description not available".

    Args:
        row (pandas.Series): String DataFrame.

    Returns:
        str: String in the abstract field format.
    """
    AMOUNT_OF_ALL_POSSIBLE_ENTRIES = 5
    count_of_not_available_parts = 0
    abstract_parts = []

    def get_not_available_message_and_increase_counter(name):
        nonlocal count_of_not_available_parts
        count_of_not_available_parts += 1
        return f"{name}: description not available"

    if (row[COLUMNS['description']]):
        abstract_parts.append(f"Facility description: {remove_trailing_dot(str(row[COLUMNS['description']]).strip())}")
    else:
        abstract_parts.append(get_not_available_message_and_increase_counter("Facility description"))

    if (row[COLUMNS['equipment']]):
        abstract_parts.append(f"Equipment: {remove_trailing_dot(str(row[COLUMNS['equipment']]).strip())}")
    else:
        abstract_parts.append(get_not_available_message_and_increase_counter('Equipment'))

    if (row[COLUMNS['controlled_parameters']]):
        abstract_parts.append(f"Controlled parameters: {remove_trailing_dot(str(row[COLUMNS['controlled_parameters']]).strip())}")
    else:
        abstract_parts.append(get_not_available_message_and_increase_counter('Controlled Parameters'))

    if (row[COLUMNS['primary_interests']]):
            abstract_parts.append(f"Primary interests: {remove_trailing_dot(str(row[COLUMNS['primary_interests']]).strip())}")
    else:
        abstract_parts.append(get_not_available_message_and_increase_counter('Primary interests'))

    if (row[COLUMNS['research_topics']]):
            abstract_parts.append(f"Research topics: {remove_trailing_dot(str(row[COLUMNS['research_topics']]).strip())}")
    else:
        abstract_parts.append(get_not_available_message_and_increase_counter('Research topics'))

    if (count_of_not_available_parts == AMOUNT_OF_ALL_POSSIBLE_ENTRIES):
        return ""

    return "; ".join(abstract_parts) + '.'

def get_keywords(row):
    keywords_parts = []

    # Adding the "Specialist areas"
    specialist_areas = process_string_column(row, "Specialist areas")
    specialist_areas_without_trailing_dot = remove_trailing_dot(specialist_areas)
    if specialist_areas_without_trailing_dot:
        keywords_parts.append(specialist_areas_without_trailing_dot)
    else:
        keywords_parts.append("not available")

    return "; ".join(keywords_parts)

def get_id(row):
    """
    Creates a unique identifier based on URL and location.

    Args:
        row (pandas.Series): String DataFrame.

    Returns:
        str: Identifier for a specific record. The identifier consists of: url + location in hashed form.
    """
    url = str(row[COLUMNS['url']]).strip() if row[COLUMNS['url']] else ""
    location = str(row[COLUMNS['location']]).strip() if row[COLUMNS['location']] else ""
    combined_url_and_location = url + location

    hasher = hashlib.sha256()
    hasher.update(combined_url_and_location.encode('utf-8'))
    hashed_identifier = hasher.hexdigest()
    return hashed_identifier

def check_that_csv_file_exists(csv_path):
    if not csv_path.exists():
        sys.exit(f"CSV does not exists: {csv_path}.")

def check_that_required_columns_exists(df: pd.DataFrame, csv_path: str):
    """
    Checks that all required columns are present in the DataFrame based on values from the COLUMNS dictionary.

    Args:
        df (pd.DataFrame): The DataFrame to be checked.
        csv_path (str): Path to CSV file (used for error reporting).

    Raises:
        SystemExit: If any required column is missing.
    """
    for required_col_name in COLUMNS.values():
        if required_col_name not in df.columns:
            sys.exit(f"The '{required_col_name}' is missing in the {csv_path} file")

def map_sample_data():
    csv_path = Path(CSV_PATH_WITH_TEST_DATA)
    check_that_csv_file_exists(csv_path)
    df = pd.read_csv(csv_path).fillna("")
    check_that_required_columns_exists(df, CSV_PATH_WITH_TEST_DATA)

    result = []
    for _, row in df.iterrows():
        id = get_id(row)
        title = str(row[COLUMNS['name']]).strip() if row[COLUMNS['name']] else ""
        url = str(row[COLUMNS['url']]).strip() if row[COLUMNS['url']] else ""
        image = row[COLUMNS['photos_of_experiments']] if row[COLUMNS['photos_of_experiments']] else ""

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