import React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";

const FilterDropdown = ({
  label,
  value,
  valueLabel,
  options,
  handleChange,
}) => {
  return (
    <div class="dropdown" id="filter_parameter_container">
      <DropdownButton title={`${label} ${valueLabel}`} id="filter_params">
        {options.map((o) => (
          <MenuItem
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

export default FilterDropdown;
