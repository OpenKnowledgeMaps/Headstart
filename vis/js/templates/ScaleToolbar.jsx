import React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";

import { useLocalizationContext } from "../components/LocalizationProvider";
import useMatomo from "../utils/useMatomo";

const ScaleToolbar = ({
  value,
  options,
  labels,
  explanations,
  showCredit,
  onChange,
  onInfoClick,
}) => {
  const localization = useLocalizationContext();
  const { trackEvent } = useMatomo();
  const handleScaleChange = (id) => {
    onChange(id);
    trackEvent("Added components", "Rescale map", labels[id]);
  };

  const handleInfoClick = (event) => {
    event.preventDefault();
    onInfoClick();
    trackEvent("Added components", "Open more info modal", "Toolbar");
  };

  return (
    <div className="scale-toolbar btn-group dropup">
      <div className="dropdown">
        <DropdownButton
          id="scale-menu"
          title={
            <>
              {localization.scale_by_label}{" "}
              <span id="curr-filter-type">{labels[value]}</span>
            </>
          }
        >
          {options.map((key) => (
            <MenuItem
              className="scale_item"
              key={key}
              eventKey={key}
              onSelect={handleScaleChange}
              active={key === value}
            >
              {labels[key]}
            </MenuItem>
          ))}
        </DropdownButton>
      </div>
      <div className="context-scale-toolbar">
        <span id="curr-scale-explanation">{explanations[value]}</span>
        <a
          id="infolink"
          className="scale-infolink"
          onClick={handleInfoClick}
          href="#"
        >
          {localization.scale_by_infolink_label}
        </a>
      </div>
      {showCredit && (
        <div id="credit">
          created by{" "}
          <a
            href="https://openknowledgemaps.org/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="logoimg"
              style={{ border: "0px" }}
              src="./img/okmaps-logo.png"
              alt="OKMaps logo"
            />
          </a>
        </div>
      )}
    </div>
  );
};

export default ScaleToolbar;
