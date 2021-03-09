import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";

const EmbedButton = ({ onClick }) => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <div>
      <button
        className="btn btn-primary"
        id="embedlink"
        title={localization.embed_button_title}
        onClick={onClick}
      >
        <i className="fa fa-code fa-fw" aria-hidden="true"></i>
      </button>
    </div>
    // html template ends here
  );
};

export default EmbedButton;
