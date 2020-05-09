import json
import time


def get_key(store, key):
    while True:
        res = store.get(key+"_output")
        if res is None:
            time.sleep(0.5)
        else:
            result = json.loads(res.decode('utf-8'))
            store.delete(key)
            store.delete(key+"_output")
            break
    return result
