import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";

const Link = ({ address, isDoi }) => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <div className="doi_outlink">
      <span>
        [{isDoi ? "doi" : localization.link}]:{" "}
        {address ? (
          <a
            className="doi_outlink_link"
            href={isDoi ? `https://dx.doi.org/${address}` : address}
            target="_blank"
            rel="noreferrer"
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
