import React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";
import useMatomo from "../../utils/useMatomo";
import HoverPopover from "../HoverPopover";
import { useLocalizationContext } from "../../components/LocalizationProvider";

const SortDropdown = ({ label, value, valueLabel, options, handleChange }) => {
  const { trackEvent } = useMatomo();
  const localization = useLocalizationContext();

  const handleSortChange = (id) => {
    handleChange(id);
    const selectedOption = options.find((o) => o.id === id);
    trackEvent(
      "List controls",
      "Sort list",
      selectedOption ? selectedOption.label : undefined
    );
  };

  return (
    <div
      className="dropdown"
      id="sort_container"
      style={{ display: "inline-block" }}
    >
      <HoverPopover
        id="sort-drop-down"
        content={
          `${label} ${valueLabel}`
        }
      >
        <DropdownButton
          id="sort"
          noCaret
          title={
            <div className="flex-container">
              <span className="truncate-text">
                {localization.sort_by_label} <span id="curr-sort-type">{valueLabel}</span>
              </span>
              <i
                className="fas fa-chevron-down chevron"
                style={{ marginLeft: "5px" }}
              ></i>
            </div>
          }
        >
          {options.map((o) => (
            <MenuItem
              id={"sort_option_" + o.id}
              key={o.id}
              eventKey={o.id}
              onSelect={handleSortChange}
              active={o.id === value}
            >
              <div className="truncate-text">{o.label}</div>
            </MenuItem>
          ))}
        </DropdownButton>
      </HoverPopover>
    </div>
  );
};

export default SortDropdown;
