import React, { FC } from "react";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { NotAvailable } from "../../types";

// TODO: This function looks strange after adding types. It must be refactored.
// it is either some value or zero
const isDefined = (param: number | string | null) => {
  if (!param) {
    return false;
  }

  return !!param || parseInt(param as string) === 0;
};

interface OrcidMetricsProps {
  citations: number | string;
  social_media: number | NotAvailable;
  references_outside_academia: null | number;
  baseUnit: null | string;
}

const OrcidMetrics: FC<OrcidMetricsProps> = ({
  citations,
  social_media,
  references_outside_academia,
  baseUnit,
}) => {
  const localization = useLocalizationContext();

  return (
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
  );
};

export default OrcidMetrics;
