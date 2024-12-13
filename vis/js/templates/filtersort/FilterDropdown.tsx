import React from "react";
import { DropdownButton, MenuItem } from "react-bootstrap";
import useMatomo from "../../utils/useMatomo";

export interface FilterDropdownProps {
  label: string;
  value: string;
  valueLabel: string;
  options: { id: string; label: string }[];
  handleChange: (id: string) => void;
}

const FilterDropdown = ({
  label,
  value,
  valueLabel,
  options,
  handleChange,
}: FilterDropdownProps) => {
  const { trackEvent } = useMatomo();
  const handleFilterChange = (id: any) => {
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
        className="truncate-text"
        title={
          <span style={{
            maxWidth: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <span>{label}</span>
            <span id="curr-filter-type" className="truncate-text" style={{
              minWidth: '0px',
              marginLeft: "3px"
            }}>{valueLabel}</span>
            <i className="fas fa-chevron-down chevron" style={{
              marginLeft: "3px"
            }}/>
          </span>
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
