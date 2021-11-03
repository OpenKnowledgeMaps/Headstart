import React from "react";
import useMatomo from "../utils/useMatomo";

const ZoomedOutHeading = ({
  introIcon,
  introLabel,
  children: title,
  additionalFeatures,
  onInfoClick,
}) => {
  const { trackEvent } = useMatomo();

  const handleInfoClick = (event) => {
    event.preventDefault();

    trackEvent("Heading", "Open more info modal", "More info button");

    if (onInfoClick) {
      onInfoClick();
    }
  };

  return (
    // html template starts here
    <h4>
      {title}{" "}
      {!!onInfoClick && (
        <button onClick={handleInfoClick} id="infolink">
          <span
            id="whatsthis"
            dangerouslySetInnerHTML={{ __html: introIcon }}
          ></span>{" "}
          {introLabel}
        </button>
      )}
      {additionalFeatures}
    </h4>
    // html template ends here
  );
};

export default ZoomedOutHeading;
