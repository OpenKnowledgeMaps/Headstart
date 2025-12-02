import requests

def insert_visualization(vis_id):
    # load the vis data from file
    with open(f"{vis_id}.json", "r") as f:
        data = f.read()

    payload = {}
    payload["vis_id"] = vis_id
    payload['vis_title'] = 'Title'
    payload['vis_clean_query'] = 'DP0878177'
    payload['vis_query'] = 'DP0878177'
    payload['vis_params'] = "{\"from\":\"1665-01-01\",\"to\":\"2022-06-21\",\"document_types\":[\"121\"],\"sorting\":\"most-relevant\",\"min_descsize\":\"300\"}"
    payload["data"] = data

    # the post target may need to be adjusted to work with the current local docker network
    res = requests.post("http://127.0.0.1:8081/dev/persistence/createVisualization/dev",
                        json=payload)
    print(res.status_code)
    print(res.text)


def main():
    vis_ids = [
        "9d4dc6b920d1e2cc08a741f7c56821db"
    ]
    for vis_id in vis_ids:
        insert_visualization(vis_id)

if __name__ == "__main__":
    main()