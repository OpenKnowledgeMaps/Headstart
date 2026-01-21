import { FC, ReactNode } from "react";

import { MetadataQualityType } from "@/js/types";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import { Localization } from "../../i18n/localization";
import useMatomo from "../../utils/useMatomo";
import HoverPopover from "../HoverPopover";

interface MetadataQualityProps {
  popoverContainer: ReactNode;
  service: "base" | "pubmed" | "aquanavi";
  quality: MetadataQualityType;
}

const MetadataQuality: FC<MetadataQualityProps> = ({
  quality,
  popoverContainer,
  service,
}) => {
  const loc = useLocalizationContext();
  const { trackEvent } = useMatomo();

  if (!["low", "high"].includes(quality)) {
    return null;
  }

  const trackMouseEnter = () =>
    trackEvent("Title & Context line", "Hover data quality", "Context line");

  const descriptionKey: keyof Localization = `${quality}_metadata_quality_desc_${service}`;
  const qualityKey: keyof Localization = `${quality}_metadata_quality`;

  if (!(descriptionKey in loc) || !(qualityKey in loc)) {
    console.error("Missing localization keys:", descriptionKey, qualityKey);
    return null;
  }

  return (
    <span
      id="metadata_quality"
      className="context_item"
      onMouseEnter={trackMouseEnter}
    >
      <HoverPopover
        id="metadata-quality-popover"
        container={popoverContainer}
        content={loc[descriptionKey]}
      >
        <span className={`context_moreinfo context_metadata_${quality}`}>
          {loc[qualityKey]}
        </span>
      </HoverPopover>
    </span>
  );
};

export default MetadataQuality;
