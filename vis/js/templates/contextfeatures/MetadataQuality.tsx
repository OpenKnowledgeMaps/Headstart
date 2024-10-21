// @ts-nocheck

import React from "react";

import HoverPopover from "../HoverPopover";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import useMatomo from "../../utils/useMatomo";

const MetadataQuality = ({ quality, popoverContainer, service }) => {
  const loc = useLocalizationContext();
  const { trackEvent } = useMatomo();

  if (!["low", "high"].includes(quality)) {
    return null;
  }

  const trackMouseEnter = () =>
    trackEvent("Title & Context line", "Hover data quality", "Context line");

  return (
    <span
      id="metadata_quality"
      className="context_item"
      onMouseEnter={trackMouseEnter}
    >
      <HoverPopover
        id="metadata-quality-popover"
        container={popoverContainer}
        content={loc[quality + "_metadata_quality_desc_" + service]}
      >
        <span className={`context_moreinfo context_metadata_${quality}`}>
          {loc[[quality + "_metadata_quality"]]}
        </span>
      </HoverPopover>
    </span>
  );
};

export default MetadataQuality;
