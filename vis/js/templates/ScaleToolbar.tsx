// @ts-nocheck
import React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";

import { useLocalizationContext } from "../components/LocalizationProvider";
import useMatomo from "../utils/useMatomo";
import HoverPopover from "./HoverPopover";

const ScaleToolbar = ({
  value,
  options,
  labels,
  explanations,
  showCredit,
  onChange,
}) => {
  const localization = useLocalizationContext();
  const { trackEvent } = useMatomo();
  const handleScaleChange = (id) => {
    onChange(id);
    trackEvent("Added components", "Rescale map", labels[id]);
  };

  return (
    <div className="scale-toolbar btn-group dropup">
      <div className="dropdown">
        <DropdownButton
          id="scale-menu"
          noCaret
          title={
            <>
              <span
                style={{
                  maxWidth: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span>{localization.scale_by_label}</span>
                <span
                  id="curr-filter-type"
                  className="truncate-text"
                  style={{
                    minWidth: "0px",
                    marginLeft: "3px",
                  }}
                >
                  {labels[value]}
                </span>
                <i
                  className="fas fa-chevron-down chevron"
                  style={{
                    marginLeft: "3px",
                  }}
                />
              </span>
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
              <div className="wrap">{labels[key]}</div>
            </MenuItem>
          ))}
        </DropdownButton>
      </div>
      <div className="context-scale-toolbar">
        <span id="curr-scale-explanation">{explanations[value]}</span>
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
