import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import useMatomo from "../../utils/useMatomo";

const Link = ({ address, isDoi }) => {
  const localization = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const trackClick = () =>
    trackEvent("List document", "Open paper link", "Text link");

  return (
    // html template starts here
    <div className="doi_outlink">
      <span>
        [{isDoi ? "doi" : localization.link}]:{" "}
        {address ? (
          <a
            className="doi_outlink_link"
            href={address}
            title="Open link in new tab"
            target="_blank"
            rel="noreferrer"
            onClick={trackClick}
          >
            {address}
          </a>
        ) : (
          localization.not_available
        )}
      </span>
    </div>
    // html template ends here
  );
};

export default Link;
