import React, { FC } from "react";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import useMatomo from "../../utils/useMatomo";

interface LinkProps {
  address: string;
  isDoi: boolean;
}

const Link: FC<LinkProps> = ({ address, isDoi }) => {
  const localization = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const trackClick = () =>
    trackEvent("List document", "Open paper link", "Text link");

  return (
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
          localization.notAvailable
        )}
      </span>
    </div>
  );
};

export default Link;
