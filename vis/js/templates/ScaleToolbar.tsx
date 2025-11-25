import React, { FC } from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";

import { useLocalizationContext } from "../components/LocalizationProvider";
import { ScaleExplanations, ScaleLabels, ScaleOptions } from "../types";
import useMatomo from "../utils/useMatomo";

interface ScaleToolbarProps {
  value: ScaleOptions;
  options: ScaleOptions[] | [];
  labels: ScaleLabels;
  explanations: ScaleExplanations;
  onChange: (newSortByValue: ScaleOptions) => void;
}

const ScaleToolbar: FC<ScaleToolbarProps> = ({
  value,
  options,
  labels,
  explanations,
  onChange,
}) => {
  const localization = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const handleScaleChange = (id: ScaleOptions) => {
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
              // @ts-ignore
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
    </div>
  );
};

export default ScaleToolbar;
