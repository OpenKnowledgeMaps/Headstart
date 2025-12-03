import json
import requests

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "OpenAIRE" / "config.json"

VISUALIZATION_DATA = []
ENDPOINT_URL = "http://127.0.0.1:8081/dev/persistence/createVisualization/dev"


def insert_from_config(config_path: Path) -> None:
    """Insert visualizations described in the given config JSON file."""
    with open(config_path, "r") as f:
        config = json.load(f)

    endpoint = config.get("endpoint", ENDPOINT_URL)
    visualizations = config.get("visualizations", VISUALIZATION_DATA)

    for vis in visualizations:
        data_file = config_path.parent / vis["data_file"]
        with open(data_file, "r") as df:
            data = df.read()

        payload = {
            "vis_id": vis["vis_id"],
            "vis_title": vis["vis_title"],
            "vis_clean_query": vis["vis_clean_query"],
            "vis_query": vis["vis_query"],
            "vis_params": vis["vis_params"],
            "data": data,
        }

        res = requests.post(endpoint, json=payload)
        print(f"Inserted {vis['vis_id']}: {res.status_code}")
        print(res.text)


def main() -> None:
    insert_from_config(CONFIG_PATH)


if __name__ == "__main__":
    main()


