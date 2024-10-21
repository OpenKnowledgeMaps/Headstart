// @ts-nocheck

import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";

// it is either some value or zero
const isDefined = (param) => !!param || parseInt(param) === 0;

const Metrics = ({ citations, tweets, readers, baseUnit }) => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <div className="list_metrics">
      <span>
        {isDefined(citations) && (
          <span
            className={
              "list_metrics_citations" +
              (baseUnit === "citations" ? " scaled-metric" : "")
            }
          >
            <span className="bold-list lowercase">{citations}</span>{" "}
            {localization.citations_count_label}
          </span>
        )}
        {isDefined(tweets) && (
          <span
            className={
              "list_metrics_tweets" +
              (baseUnit === "tweets" ? " scaled-metric" : "")
            }
          >
            <span className="bold-list lowercase">{tweets}</span>{" "}
            {localization.tweets_count_label}
          </span>
        )}
        {isDefined(readers) && (
          <span
            className={
              "list_metrics_readers" +
              (baseUnit === "readers" ? " scaled-metric" : "")
            }
          >
            <span className="bold-list lowercase">{readers}</span>{" "}
            {localization.readers_count_label}
          </span>
        )}
      </span>
    </div>
    // html template ends here
  );
};

export default Metrics;
