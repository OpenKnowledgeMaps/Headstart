import React from "react";

const ZoomedOutHeading = ({
  introIcon,
  introLabel,
  children: title,
  additionalFeatures,
}) => {
  return (
    // html template starts here
    <h4>
      {title}{" "}
      <a data-toggle="modal" data-type="text" href="#info_modal" id="infolink">
        <span
          id="whatsthis"
          dangerouslySetInnerHTML={{ __html: introIcon }}
        ></span>{" "}
        {introLabel}
      </a>
      {additionalFeatures}
    </h4>
    // html template ends here
  );
};

export default ZoomedOutHeading;
