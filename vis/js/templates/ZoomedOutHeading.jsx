import React from "react";

const ZoomedOutHeading = ({
  introIcon,
  introLabel,
  children: title,
  additionalFeatures,
  onInfoClick,
}) => {
  const handleInfoClick = (event) => {
    event.preventDefault();
    if (onInfoClick) {
      onInfoClick();
    }
  };

  return (
    // html template starts here
    <h4>
      {title}{" "}
      {!!onInfoClick && (
        <a onClick={handleInfoClick} id="infolink" href="#">
          <span
            id="whatsthis"
            dangerouslySetInnerHTML={{ __html: introIcon }}
          ></span>{" "}
          {introLabel}
        </a>
      )}
      {additionalFeatures}
    </h4>
    // html template ends here
  );
};

export default ZoomedOutHeading;
