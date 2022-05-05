import React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";
import useMatomo from "../../utils/useMatomo";

const SortDropdown = ({ label, value, valueLabel, options, handleChange }) => {
  const { trackEvent } = useMatomo();
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
      <DropdownButton
        id="sort"
        noCaret
        title={
          <>
            {label} <span id="curr-sort-type">{valueLabel}</span>{" "}
            <i className="fas fa-chevron-down chevron"></i>
          </>
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
            {o.label}
          </MenuItem>
        ))}
      </DropdownButton>
    </div>
  );
};

export default SortDropdown;
