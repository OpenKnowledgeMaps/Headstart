import re
import ast
import sys
import hashlib
import pandas as pd

from pathlib import Path

PATH_TO_FOLDER_IN_CONTAINER = "common/common/aquanavi/"
CSV_PATH_WITH_REAL_DATA = f"{PATH_TO_FOLDER_IN_CONTAINER}mesocosm_data_cleaned.csv"
CSV_PATH_WITH_TEST_DATA = f"{PATH_TO_FOLDER_IN_CONTAINER}mesocosm_test_data.csv"
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

def process_string_column(row, column_name):
    """
    Process the column name from DataFrame.

    Args:
        row (pandas.Series): String DataFrame.
        column_name (str): Name of a column that must be processed.

    Returns:
        str: The processed string (parts separated by commas, or the original string),
        or an empty string if the original value was empty.
    """
    value = row[column_name]

    if value:
        processed_string = str(value).strip()

        if "\n" in processed_string:
            parts = [part.strip() for part in processed_string.split("\n") if part.strip()]
            return "; ".join(parts)
        else:
            return processed_string
    else:
        return ""

def remove_trailing_dot(string):
    """
    Remove the dot from the end of the string (if it is existing the string).

    Args:
        string (str): String with/without dot at the end.

    Returns:
        str: String without dot at the end.
    """
    if string and string.endswith('.'):
        return string[:-1]
    return string

def get_and_process_value(row, column_name, is_remove_trailing_dot):
    """
    The function returns a value from a column with line breaks handling,
    as well as removing the dot from the end of the value (string).

    Args:
        row (str): String DataFrame.
        column_name (str): Name of a column that must be processed.

    Returns:
        str: String with value without dot at the end.
    """
    value = process_string_column(row, column_name)
    if is_remove_trailing_dot:
        value = remove_trailing_dot(value)

    return value

def get_latitude_longitude(row):
    """
    The function returns a list with latitude and longitude.

    Args:
        row (str): String DataFrame.

    Returns:
        list: A list with latitude and longitude (or None).
    """
    coordinates_string = str(row[COLUMNS['location']]).strip()

    latitude, longitude = None, None

    if "," in coordinates_string:
        try:
            coords = ast.literal_eval(coordinates_string)
            if isinstance(coords, (list, tuple)) and len(coords) == 2:
                latitude = float(str(coords[0]).strip())
                longitude = float(str(coords[1]).strip())
        except Exception:
            latitude, longitude = None, None

    return [latitude, longitude]

def get_years_of_experiments(row):
    """
    The function returns a time range in the list format.
    First value represents a starting date, second one - ending date.
    Supported formats: yyyy - present; yyyy - yyyy; yyyy to present; since yyyy;
    started yyyy / starting yyyy / operational since yyyy; yyyy-present.
    All other date formats in the "Years of Mesocosm Experiments" column will be ignored.

    Args:
        row (str): String DataFrame.

    Returns:
        list: A list with start and end dates.
    """
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
    coverage_parts.append(f"east={longitude}" if longitude else "east=")
    coverage_parts.append(f"north={latitude}" if latitude else "north=")
    coverage_parts.append(f"start={start}" if start else "start=")
    coverage_parts.append(f"end={end}" if end else "end=")

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
        abstract_parts.append(f"Facility description: {get_and_process_value(row, COLUMNS['description'], True)}")
    else:
        abstract_parts.append(get_not_available_message_and_increase_counter("Facility description"))

    if (row[COLUMNS['equipment']]):
        abstract_parts.append(f"Equipment: {get_and_process_value(row, COLUMNS['equipment'], True)}")
    else:
        abstract_parts.append(get_not_available_message_and_increase_counter('Equipment'))

    if (row[COLUMNS['controlled_parameters']]):
        abstract_parts.append(f"Controlled parameters: {get_and_process_value(row, COLUMNS['controlled_parameters'], True)}")
    else:
        abstract_parts.append(get_not_available_message_and_increase_counter('Controlled Parameters'))

    if (row[COLUMNS['primary_interests']]):
            abstract_parts.append(f"Primary interests: {get_and_process_value(row, COLUMNS['primary_interests'], True)}")
    else:
        abstract_parts.append(get_not_available_message_and_increase_counter('Primary interests'))

    if (row[COLUMNS['research_topics']]):
            abstract_parts.append(f"Research topics: {get_and_process_value(row, COLUMNS['research_topics'], True)}")
    else:
        abstract_parts.append(get_not_available_message_and_increase_counter('Research topics'))

    if (count_of_not_available_parts == AMOUNT_OF_ALL_POSSIBLE_ENTRIES):
        return ""

    return "; ".join(abstract_parts) + '.'

def get_keywords(row):
    """
    Creates the keywords field for each data entry. The keywords field contains
    string value with data from the Specialist Areas column. If column does not contains information,
    an empty string is returned.

    Args:
        row (pandas.Series): String DataFrame.

    Returns:
        str: String with keywords.
    """
    specialist_areas = get_and_process_value(row, COLUMNS['specialist_areas'], False)

    if specialist_areas:
        return specialist_areas

    return ""

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
    """
    This function checks that .CSV file exists in the file system.

    Args:
        csv_path (str): A string with path to the .CSV file.

    Raises:
        SystemExit: If any required column is missing.
    """
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

def load_and_prepare_dataframe():
    """
    Loads CSV files with data and test cases.

    Returns:
        DataFrame: Pandas DataFrame with information from CSVs.
    """
    csv_real_path = Path(CSV_PATH_WITH_REAL_DATA)
    csv_test_path = Path(CSV_PATH_WITH_TEST_DATA)

    check_that_csv_file_exists(csv_real_path)
    check_that_csv_file_exists(csv_test_path)

    df_real = pd.read_csv(csv_real_path).fillna("")
    df_test = pd.read_csv(csv_test_path).fillna("")

    df = pd.concat([df_real, df_test], ignore_index=True)
    check_that_required_columns_exists(df, CSV_PATH_WITH_REAL_DATA)

    return df

def map_sample_data():
    df = load_and_prepare_dataframe()

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