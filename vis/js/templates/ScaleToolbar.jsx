import React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";

import { useLocalizationContext } from "../components/LocalizationProvider";

const ScaleToolbar = ({
  value,
  options,
  labels,
  explanations,
  onChange,
  onInfoClick,
}) => {
  const localization = useLocalizationContext();

  const handleInfoClick = (event) => {
    event.preventDefault();
    onInfoClick();
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
              onSelect={onChange}
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
    </div>
  );
};

export default ScaleToolbar;
