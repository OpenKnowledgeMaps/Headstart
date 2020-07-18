import pandas as pd
import logging
import sys
import os
import numpy as np

from itertools import chain
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import NMF, LatentDirichletAllocation

formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')
np.random.seed(42)


class Streamgraph(object):

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(os.environ["HEADSTART_LOGLEVEL"])
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        handler.setLevel(os.environ["HEADSTART_LOGLEVEL"])
        self.logger.addHandler(handler)

    def get_streamgraph_data(self, metadata, query, n=12, method="tfidf"):
        df = pd.DataFrame.from_records(metadata)
        df.year = pd.to_datetime(df.year)
        df.year = df.year.map(lambda x: x.year)
        df.year = df.year.map(lambda x: pd.to_datetime(x, format="%Y"))
        df = df[df.subject.map(lambda x: x is not None)]
        df.subject = df.subject.map(lambda x: [s for s in x.split("; ") if s])
        df = df[df.subject.map(lambda x: x != [])]
        df["boundary_label"] = df.year
        df = df.explode('subject')
        df = df[df.subject != ""]
        counts = self.get_counts(df)
        boundaries = self.get_boundaries(df)
        daterange = self.get_daterange(boundaries)
        data = pd.merge(counts, boundaries, on='year')
        top_n = self.get_top_n(metadata, data, n, method)
        data = (data[data.subject.map(lambda x: x in top_n)]
                .sort_values("year")
                .reset_index(drop=True))
        x = self.self.get_x_axis(daterange)
        sg_data = {}
        sg_data["x"] = x
        sg_data["subject"] = self.postprocess(daterange, data)
        return sg_data

    @staticmethod
    def get_x_axis(daterange):
        return [str(x.year) for x in daterange]

    @staticmethod
    def get_daterange(boundaries):
        daterange = pd.date_range(start=min(boundaries.year).to_datetime64(),
                                  end=max(boundaries.year).to_datetime64(),
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

    def get_top_n(self, metadata, data, n, method):
        df = pd.DataFrame.from_records(metadata)
        df = df[df.subject.map(lambda x: len(x) > 2)]
        corpus = df.subject.tolist()
        # set stopwords , stop_words='english'
        tf_vectorizer = CountVectorizer(max_df=0.95, min_df=2,
                                        tokenizer=lambda x: x.split("; "),
                                        lowercase=False,
                                        )
        tfidf_vectorizer = TfidfVectorizer(max_df=0.95, min_df=2,
                                           tokenizer=lambda x: x.split("; "),
                                           lowercase=False,
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

    @staticmethod
    def postprocess(daterange, data):
        x = pd.DataFrame(daterange, columns=["year"])
        temp = []
        for item in pd.unique(data.subject):
            tmp = (pd.merge(data[data.subject == item], x,
                            left_on="year", right_on="year",
                            how="right")
                     .fillna({"counts": 0, "subject": item, "id": "NA"})
                     .sort_values("year"))
            y = tmp.counts.astype(int).to_list()
            ids_overall = (pd.unique(tmp[tmp.id != "NA"]
                                     .id.map(lambda x: x.split(", "))
                                     .explode()).tolist())
            ids_timestep = tmp.id.map(lambda x: x.split(", ")).tolist()
            temp.append({"name": item, "y": y,
                         "ids_overall": ids_overall,
                         "ids_timestep": ids_timestep})
        df = pd.DataFrame.from_records(temp)
        return df.to_dict(orient="records")
