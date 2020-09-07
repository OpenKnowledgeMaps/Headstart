import json
import pandas as pd
import numpy as np
import requests
from tqdm import tqdm


api_url = "http://127.0.0.1/api"
df = pd.read_csv("Backend regression test cases.csv")


def extract_params(case):
    search = {}
    search["service"] = case.get("data integration", "").lower()
    search["q"] = case.get("search query", "")
    search["from"] = case.get("from", "")
    search["to"] = case.get("to", "")
    search["sorting"] = case.get("sorting", "")
    search["article_types"] = case.get("article types", "[]")
    return search


def get_input_data(search, raw=False):
    params = search
    service = params.pop('service')
    if service not in ["base", "pubmed"]:
        return None
    if service == "pubmed":
        params.pop("article_types")
        params["limit"] = 100
    if service == "base":
        params["limit"] = 120
        doctypes = eval(params["article_types"])
        if isinstance(doctypes, list):
            params["document_types"] = [a for a in doctypes]
        else:
            params["document_types"] = [121]
        params.pop("article_types", [])
    if raw:
        params["raw"] = True
    url = "/".join([api_url, service, "search"])
    res = requests.post(url, json=params)
    return res


for r in tqdm(df.iterrows()):
    case = dict(r[1])
    if np.isnan(case["case id"]):
        continue
    s = extract_params(case)
    res = get_input_data(s, raw=True)
    if res is None:
        continue
    res_json = res.json()
    res_json.pop("id")
    input_data = res_json["input_data"]
    params = res_json["params"]
    with open("knowncases/testcase%d.json" % case["case id"], "w") as outfile:
        json.dump(res_json, outfile, indent=4, separators=(',', ': '), sort_keys=True)
