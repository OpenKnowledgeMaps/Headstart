import React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";
import useMatomo from "../../utils/useMatomo";

const FilterDropdown = ({
  label,
  value,
  valueLabel,
  options,
  handleChange,
}) => {
  const { trackEvent } = useMatomo();
  const handleFilterChange = (id) => {
    handleChange(id);
    const selectedOption = options.find((o) => o.id === id);
    const isOA = options.some((o) => o.label === "Open Access");
    trackEvent(
      "List controls",
      isOA ? "Filter open access" : "Filter document types",
      selectedOption ? selectedOption.label : undefined
    );
  };

  return (
    <div className="dropdown" id="filter_parameter_container">
      <DropdownButton
        id="filter_params"
        noCaret
        title={
          <>
            {label} <span id="curr-filter-type">{valueLabel}</span>{" "}
            <i className="fas fa-chevron-down chevron"></i>
          </>
        }
      >
        {options.map((o) => (
          <MenuItem
            id={"filter_option_" + o.id}
            key={o.id}
            eventKey={o.id}
            onSelect={handleFilterChange}
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
