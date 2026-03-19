import ast
import math

from ..constants.constants import COLUMNS

# Cap jitter so markers stay near the original location.
MAX_OFFSET_METERS = 30.0
# Controls how quickly the offset grows for the 2nd, 3rd, ... duplicates.
GROWTH_FACTOR = 6.0
# Golden angle for an even spiral distribution.
GOLDEN_ANGLE_DEGREES = 137.50776405003785
# Approx conversion: meters per 1 degree of latitude.
METERS_PER_DEGREE_LAT = 111_111.0
# Avoid division by ~0 for longitude conversion near the poles.
COS_EPSILON = 1e-6

def get_row_coordinates_with_collision_offset(row, seen_coordinates):
    """
    Returns row coordinates with a small deterministic offset applied for duplicates.

    Args:
        row (pandas.Series): DataFrame row.
        seen_coordinates (dict[tuple[float, float], int]): Occurrence counter by exact (lat, lon).

    Returns:
        tuple[float|None, float|None]: (latitude, longitude), possibly offset for duplicates.
    """
    latitude, longitude = get_latitude_longitude(row)

    duplicate_index = 0
    if latitude is not None and longitude is not None:
        key = (latitude, longitude)
        duplicate_index = seen_coordinates.get(key, 0)
        seen_coordinates[key] = duplicate_index + 1

    return offset_duplicate_coordinates(latitude, longitude, duplicate_index)

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

def offset_duplicate_coordinates(latitude, longitude, duplicate_index):
    """
    Applies a tiny deterministic offset (meters) to avoid marker collision for identical coordinates.

    The offset is intentionally limited to keep the point nearby while making collisions visible.

    Args:
        latitude (float|None): Latitude.
        longitude (float|None): Longitude.
        duplicate_index (int): 0 for the first occurrence (no offset), 1..N for duplicates.

    Returns:
        tuple[float|None, float|None]: (latitude, longitude) with offset applied.
    """
    if latitude is None or longitude is None:
        return latitude, longitude
    if duplicate_index <= 0:
        return latitude, longitude

    golden_angle_rad = math.radians(GOLDEN_ANGLE_DEGREES)
    angle = duplicate_index * golden_angle_rad

    radius_m = min(GROWTH_FACTOR * math.sqrt(duplicate_index), MAX_OFFSET_METERS)
    east_m = radius_m * math.cos(angle)
    north_m = radius_m * math.sin(angle)

    lat_rad = math.radians(latitude)
    meters_per_degree_lon = METERS_PER_DEGREE_LAT * max(math.cos(lat_rad), COS_EPSILON)

    dlat = north_m / METERS_PER_DEGREE_LAT
    dlon = east_m / meters_per_degree_lon

    return latitude + dlat, longitude + dlon
