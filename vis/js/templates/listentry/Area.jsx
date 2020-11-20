import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";

const Area = ({ children, onClick, onMouseOver, onMouseOut }) => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <div
      id="list_area"
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <span className="area_tag">{localization.area}:</span>{" "}
      <span className="area_name">{children}</span>
    </div>
    // html template ends here
  );
};

export default Area;
