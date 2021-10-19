import React from "react";

import okmapsRoundLogo from "../../../images/okmaps-logo-round-small.png";

import { getDateTimeFromTimestamp } from "../../utils/dates";

const CreatedBy = ({ timestamp, faqsUrl }) => (
  <div className="builtwith" id="builtwith">
    <img src={okmapsRoundLogo} alt="OKMaps round logo" />{" "}
    <a href={window.location.href} target="_blank" rel="noreferrer">
      This visualization
    </a>{" "}
    was created by{" "}
    <a href="https://openknowledgemaps.org" target="_blank" rel="noreferrer">
      Open Knowledge Maps
    </a>{" "}
    {getDateTimeFromTimestamp(timestamp)}. For more information{" "}
    <a href={faqsUrl} target="_blank" rel="noreferrer">
      read our FAQs
    </a>
    .
  </div>
);

export default CreatedBy;
