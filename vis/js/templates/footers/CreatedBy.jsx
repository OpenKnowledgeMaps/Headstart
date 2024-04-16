import React from "react";

import okmapsRoundLogo from "../../../images/okmaps-logo-round.svg";

import { getDateTimeFromTimestamp } from "../../utils/dates";
import useMatomo from "../../utils/useMatomo";

const CreatedBy = ({ timestamp, faqsUrl }) => {
    const dateTime = getDateTimeFromTimestamp(timestamp);
    const {trackEvent} = useMatomo();

    const trackLink = (action) =>
        trackEvent("Added components", action, "Footer");


    // function remove "?embed=true" parameter from url
    function urlWithoutEmbed() {
        if (window.location.href.includes("?embed=true&")) {
            return window.location.href.replace("embed=true&", "");
        } else if (window.location.href.includes("?embed=true")) {
            return window.location.href.replace("?embed=true", "");
        }
        if (window.location.href.includes("&embed=true")) {
            return window.location.href.replace("&embed=true", "");
        }
        return window.location.href
    }

    return (
        <div className="builtwith" id="builtwith">
            <img src={okmapsRoundLogo} alt="OKMaps round logo"/>{" "}
            <a
                href={urlWithoutEmbed()}
                name={"openVisualization"}
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
