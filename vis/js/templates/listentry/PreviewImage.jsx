import React from "react";

import defaultImage from "../../../images/preview_pdf.png";

import { isFileAvailable } from "../../utils/data";
import useMatomo from "../../utils/useMatomo";

const PreviewImage = ({ imageURL = defaultImage, onClick }) => {
  const { trackEvent } = useMatomo();

  if (imageURL !== defaultImage && !isFileAvailable(imageURL)) {
    return null;
  }

  const transboxStyle = {
    width: 230,
    height: 298,
  };

  const imageStyle = {
    ...transboxStyle,
    background: `url(${imageURL}) 0% 0% / 230px,  0% 0% / 298px`,
  };

  const handleClick = () => {
    onClick();
    trackEvent("List paper", "Show PDF preview", "Preview image");
  };

  return (
    // html template starts here
    <div id="preview_image" style={imageStyle} onClick={handleClick}>
      <div id="transbox" style={transboxStyle}>
        Click here to open preview
      </div>
    </div>
    // html template ends here
  );
};

export default PreviewImage;
