import React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";

const SortDropdown = ({ label, value, valueLabel, options, handleChange }) => {
  return (
    <div
      className="dropdown"
      id="sort_container"
      style={{ display: "inline-block" }}
    >
      <DropdownButton
        id="sort"
        title={
          <>
            {label} <span id="curr-sort-type">{valueLabel}</span>
          </>
        }
      >
        {options.map((o) => (
          <MenuItem
            id={"sort_option_" + o.id}
            key={o.id}
            eventKey={o.id}
            onSelect={handleChange}
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
