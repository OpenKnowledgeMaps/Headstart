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
    <div className="heading-container">
      <h4 className="heading">{title}</h4>
      <h4 className="features">
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
    </div>
    // html template ends here
  );
};

export default ZoomedOutHeading;
