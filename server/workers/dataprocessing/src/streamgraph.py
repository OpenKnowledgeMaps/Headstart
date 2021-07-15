import pandas as pd
import logging
import sys
import re
import numpy as np

from itertools import chain
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import NMF, LatentDirichletAllocation

formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')
np.random.seed(42)


class Streamgraph(object):

    def __init__(self, loglevel="INFO"):
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(loglevel)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        handler.setLevel(loglevel)
        self.logger.addHandler(handler)

    def get_streamgraph_data(self, metadata, query, n=12, method="tfidf"):
        metadata = pd.DataFrame.from_records(metadata)
        df = metadata.copy()
        df.year = pd.to_datetime(df.year)
        df = df[df.subject.map(lambda x: x is not None)]
        df.subject = df.subject.map(lambda x: [s for s in x.split("; ")] if isinstance(x, str) else "")
        df = df[df.subject.map(lambda x: x != [])]
        df["boundary_label"] = df.year
        df = df.explode('subject')
        df = df[df.subject != ""]
        counts = self.get_counts(df)
        boundaries = self.get_boundaries(df)
        daterange = self.get_daterange(boundaries)
        data = pd.merge(counts, boundaries, on='year')
        top_n = self.get_top_n(metadata.copy(), query, n, method)
        sanitized_top_n = [re.escape(t) for t in top_n]
        data = (data[data.subject.str.contains('|'.join(sanitized_top_n), flags=re.IGNORECASE)]
                .sort_values("year")
                .reset_index(drop=True))
        sg_data = {}
        sg_data["x"], sg_data["subject"] = self.postprocess(daterange, data, top_n)
        return sg_data

    @staticmethod
    def get_x_axis(daterange):
        return [str(x.year) for x in daterange]

    @staticmethod
    def get_daterange(boundaries):
        daterange = pd.date_range(start=min(boundaries.year),
                                  end=max(boundaries.year),
                                  freq='AS')
        if len(daterange) > 0:
            return sorted(daterange)
        else:
            return sorted(pd.unique(boundaries.year))

    @staticmethod
    def get_stream_range(df):
        stream_range = {
            "min": min(df.year),
            "max": max(df.year),
            "range": max(df.year) - min(df.year)
        }
        return stream_range

    @staticmethod
    def get_counts(df):
        counts = (df.groupby(["year", "subject"])
                    .agg({'subject': 'count', 'id': lambda x: ", ".join(x)}))
        counts.rename({"subject": "counts"}, axis=1, inplace=True)
        counts.reset_index(inplace=True)
        return counts

    @staticmethod
    def get_boundaries(df):
        boundaries = df[["boundary_label", "year"]].drop_duplicates()
        return boundaries

    def get_top_n(self, df, query, n, method):
        df = df[df.subject.map(lambda x: len(x) > 2)]
        corpus = df.subject.tolist()
        # set stopwords , stop_words='english'
        tf_vectorizer = CountVectorizer(max_df=0.95, min_df=2,
                                        tokenizer=lambda x: x.split("; "),
                                        lowercase=False,
                                        stop_words=[query]
                                        )
        tfidf_vectorizer = TfidfVectorizer(max_df=0.95, min_df=2,
                                           tokenizer=lambda x: x.split("; "),
                                           lowercase=False,
                                           stop_words=[query]
                                           )
        if method == "count":
            tf = tf_vectorizer.fit_transform(corpus)
            counts = pd.DataFrame(tf.toarray(),
                                  columns=tf_vectorizer.get_feature_names())
            candidates = counts.sum().sort_values(ascending=False).index.tolist()
            candidates = [c for c in candidates if len(c) > 0]
            top_n = candidates[:n]
        if method == "tfidf":
            tfidf = tfidf_vectorizer.fit_transform(corpus)
            weights = pd.DataFrame(tfidf.toarray(),
                                   columns=tfidf_vectorizer.get_feature_names())
            candidates = weights.sum().sort_values(ascending=False).index.tolist()
            candidates = [c for c in candidates if len(c) > 0]
            top_n = candidates[:n]
        if method == "nmf":
            tfidf = tfidf_vectorizer.fit_transform(corpus)
            nmf = NMF(n_components=n,
                      alpha=.1, l1_ratio=.5, init='nndsvd',
                      random_state=42).fit(tfidf)
            top_n = list(chain.from_iterable(
                            [self.get_top_words(t, tfidf_vectorizer.get_feature_names(), 1)
                             for t in nmf.components_]))
        if method == "lda":
            tf = tf_vectorizer.fit_transform(corpus)
            lda = LatentDirichletAllocation(n_components=n, max_iter=20,
                                            learning_method='batch',
                                            learning_offset=50.,
                                            random_state=42).fit(tf)
            top_n = list(chain.from_iterable(
                            [self.get_top_words(t, tf_vectorizer.get_feature_names(), 1)
                             for t in lda.components_]))
        return top_n

    @staticmethod
    def get_top_words(topic, feature_names, n):
        indices = topic.argsort()[::-1]
        words = [feature_names[i] for i in indices]
        words = [w for w in words if len(w) > 2]
        return words[:n]

    def postprocess(self, daterange, data, top_n):
        x = pd.DataFrame(daterange, columns=["year"])
        temp = []
        for item in top_n:
            tmp = (pd.merge(data[data.subject.str.contains(item, case=False, regex=False)], x,
                            left_on="year", right_on="year",
                            how="right")
                     .groupby("year")
                     .agg({"subject": "sum",
                           "counts": "sum",
                           "id": aggregate_ids,
                           "boundary_label": "max"})
                     .fillna({"counts": 0, "subject": item, "id": "NA"})
                     .sort_values("year"))
            tmp["subject"] = item
            tmp["counts"] = tmp["id"].map(lambda x: len(list(filter(lambda x: x!="NA", x.split(",")))))
            y = tmp.counts.astype(int).to_list()
            ids_overall = (pd.unique(tmp[tmp.id != "NA"]
                                     .id.map(lambda x: x.split(", "))
                                     .explode()).tolist())
            ids_timestep = tmp.id.map(lambda x: x.split(", ")).tolist()
            temp.append({"name": item, "y": y,
                         "ids_overall": ids_overall,
                         "ids_timestep": ids_timestep})
        df = pd.DataFrame.from_records(temp)
        x, df = self.reduce_daterange(daterange, df)
        return x, df.to_dict(orient="records")
    
    def reduce_daterange(self, daterange, df):
        x = self.get_x_axis(daterange)
        yearly_sums = pd.DataFrame(df.y.to_list()).T.sum(axis=1)
        yearly_sums_cum = yearly_sums.cumsum()
        # 5% which is chosen here is an arbitrary value, could also be higher 10% or lower
        min_value = int(yearly_sums.sum() * 0.05)
        start_index = yearly_sums_cum[yearly_sums_cum > min_value].index[0]
        df.y = df.y.map(lambda x: x[start_index+1:])
        df.ids_timestep = df.ids_timestep.map(lambda x: x[start_index+1:])
        x = x[start_index+1:]
        return x, df
    
    @staticmethod
    def reduce_metadata_set(metadata, sg_data):
        metadata = pd.read_json(metadata)
        df = pd.DataFrame.from_records(sg_data["subject"])
        all_ids = set(chain.from_iterable(df.ids_overall))
        metadata = metadata[metadata.id.map(lambda x: x in all_ids)]
        return metadata.to_json(orient="records")

def aggregate_ids(series):
    try:
        return ", ".join(pd.unique(series))
    except Exception:
        return "NA"