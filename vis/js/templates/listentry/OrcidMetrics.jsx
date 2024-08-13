import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";

// it is either some value or zero
const isDefined = (param) => !!param || parseInt(param) === 0;

const OrcidMetrics = ({
  citations,
  social_media,
  references_outside_academia,
  baseUnit,
}) => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <div className="list_metrics">
      <span>
        <span
          className={
            "list_metrics_item" +
            (baseUnit === "citations" ? " scaled-metric" : "")
          }
        >
          <span className="bold-list lowercase">
            {isDefined(citations) ? citations : "n/a"}
          </span>{" "}
          {localization.citations_count_label}
        </span>
        <span
          className={
            "list_metrics_item" +
            (baseUnit === "social" ? " scaled-metric" : "")
          }
        >
          <span className="bold-list lowercase">
            {isDefined(social_media) ? social_media : "n/a"}
          </span>{" "}
          {localization.social_media_count_label}
        </span>

        <span
          className={
            "list_metrics_item" +
            (baseUnit === "references" ? " scaled-metric" : "")
          }
        >
          <span className="bold-list lowercase">
            {isDefined(references_outside_academia)
              ? references_outside_academia
              : "n/a"}
          </span>{" "}
          {localization.references_count_label}
        </span>
      </span>
    </div>
    // html template ends here
  );
};

export default OrcidMetrics;
