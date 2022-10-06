import React from "react";

import okmapsRoundLogo from "../../../images/okmaps-logo-round.svg";

import { getDateTimeFromTimestamp } from "../../utils/dates";
import useMatomo from "../../utils/useMatomo";

const CreatedBy = ({ timestamp, faqsUrl }) => {
  const dateTime = getDateTimeFromTimestamp(timestamp);
  const { trackEvent } = useMatomo();

  const trackLink = (action) =>
    trackEvent("Added components", action, "Footer");

  return (
    <div className="builtwith" id="builtwith">
      <img src={okmapsRoundLogo} alt="OKMaps round logo" />{" "}
      <a
        href={window.location.href}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackLink("Open this visualization")}
      >
        This visualization
      </a>{" "}
      was created by{" "}
      <a
        href="https://openknowledgemaps.org"
        target="_blank"
        rel="noreferrer"
        onClick={() => trackLink("Open main page")}
      >
        Open Knowledge Maps
      </a>
      {dateTime ? " " + dateTime : ""}. For more information{" "}
      <a
        href={faqsUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackLink("Open FAQs")}
      >
        read our FAQs
      </a>
      .
    </div>
  );
};

export default CreatedBy;
