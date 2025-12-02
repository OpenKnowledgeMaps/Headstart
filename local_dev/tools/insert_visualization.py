import requests

def insert_visualization(vis_id):
    # load the vis data from file
    with open(f"{vis_id}.json", "r") as f:
        data = f.read()
    payload = {}
    payload["vis_id"] = vis_id
    # data is expected to be a json string
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