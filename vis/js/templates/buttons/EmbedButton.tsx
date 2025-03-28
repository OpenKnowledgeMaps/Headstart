// @ts-nocheck
import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import useMatomo from "../../utils/useMatomo";

const EmbedButton = ({ onClick, isStreamgraph }) => {
  const localization = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const handleClick = () => {
    trackEvent("Added components", "Open embed modal", "Embed button");
    onClick();
  };

  return (
    // html template starts here
    <div>
      <button
        className="btn btn-primary"
        id="embedlink"
        title={
          isStreamgraph
            ? localization.embed_button_title_sg
            : localization.embed_button_title
        }
        onClick={handleClick}
      >
        <i className="fa fa-code fa-fw" aria-hidden="true"></i>
      </button>
    </div>
    // html template ends here
  );
};

export default EmbedButton;
