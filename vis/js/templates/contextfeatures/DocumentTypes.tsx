import React, { FC, ReactNode } from "react";
import HoverPopover from "../HoverPopover";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import useMatomo from "../../utils/useMatomo";

interface DocumentTypesProps {
  documentTypes: string[];
  popoverContainer: ReactNode;
}

const DocumentTypes: FC<DocumentTypesProps> = ({
  documentTypes,
  popoverContainer,
}) => {
  const loc = useLocalizationContext();
  const { trackEvent } = useMatomo();

  if (!documentTypes || documentTypes.length === 0) {
    return null;
  }

  const text = documentTypes.join(", ");

  const trackMouseEnter = () =>
    trackEvent("Title & Context line", "Hover document types", "Context line");

  return (
    <>
      <span
        id="document_types"
        className="context_item"
        onMouseEnter={trackMouseEnter}
      >
        <HoverPopover
          id="doctypes-popover"
          size="wide"
          container={popoverContainer}
          content={
            <>
              {loc.documenttypes_tooltip}
              <br />
              <br />
              {text}
            </>
          }
        >
          <span className="context_moreinfo">{loc.documenttypes_label}</span>
        </HoverPopover>
      </span>
      {/* this empty space was on web interface in context line */}
      {/*{" "}*/}
    </>
  );
};

export default DocumentTypes;
