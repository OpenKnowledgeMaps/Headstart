import pandas as pd


def get_streamgraph_data(metadata, n=12):
    df = pd.DataFrame.from_records(metadata)
    df.year = pd.to_datetime(df.year)
    df.year = df.year.map(lambda x: x.year)
    df.subject = df.subject.map(lambda x: x.split("; "))
    df["boundary_label"] = df.year.astype(int)
    df = df.explode('subject')
    counts = get_counts(df)
    boundaries = get_boundaries(df)
    data = pd.merge(counts, boundaries, on='year')
    top_n = get_top_n(data, n)
    data = data[data.subject.map(lambda x: x in top_n)].sort_values("year").reset_index(drop=True)
    data = data[data.subject != ""]
    sg_data = {}
    sg_data["x"] = get_daterange(boundaries)
    sg_data["subject"] = postprocess(boundaries, data)
    return data


def get_daterange(boundaries):
    daterange = pd.date_range(start=min(boundaries.year),
                              end=max(boundaries.year),
                              freq='A')
    if len(daterange) > 0:
        return sorted(daterange.to_list())
    else:
        return sorted(pd.unique(boundaries.year).tolist())


def get_stream_range(df):
    stream_range = {
        "min": min(df.year),
        "max": max(df.year),
        "range": max(df.year) - min(df.year)
    }
    return stream_range


def get_counts(df):
    counts = (df.groupby(["year", "subject"])
                .agg({'subject': 'count', 'id': lambda x: ", ".join(x)}))
    counts.rename({"subject": "counts"}, axis=1, inplace=True)
    counts.reset_index(inplace=True)
    return counts


def get_boundaries(df):
    boundaries = df[["boundary_label", "year"]].drop_duplicates()
    return boundaries


def get_top_n(data, n):
    top_n = (data.groupby('subject')
                 .agg({"counts": "sum"})
                 .sort_values("counts", ascending=False)
                 .head(n).index.to_list())
    return top_n


def postprocess(boundaries, data):
    daterange = list(range(min(boundaries.year), max(boundaries.year)))
    x = pd.DataFrame(daterange, columns=["year"])
    temp = []
    for item in pd.unique(data.subject):
        tmp = (pd.merge(data[data.subject == item].drop("year", axis=1), x,
                        left_on="boundary_label", right_on="year",
                        how="right")
                 .fillna({"counts": 0, "subject": item, "id": "NA"}))
        y = tmp.counts.astype(int).to_list()
        ids_overall = pd.unique(tmp[tmp.id != "NA"].id.map(lambda x: x.split(", ")).explode()).tolist()
        ids_timestep = tmp.id.map(lambda x: x.split(", ")).tolist()
        temp.append({"name": item, "y": y, "ids_overall": ids_overall, "ids_timestep": ids_timestep})
    df = pd.DataFrame.from_records(temp)
    return df.to_dict(orient="records")
