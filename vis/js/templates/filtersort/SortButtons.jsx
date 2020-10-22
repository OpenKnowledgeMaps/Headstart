import React from "react";
import { ToggleButtonGroup, ToggleButton } from "react-bootstrap";

const SortButtons = ({ label, value, options, handleChange }) => {
  return (
    <div
      className="dropdown"
      id="sort_container"
      style={{ display: "inline-block" }}
    >
      <span id="sortby">{label}</span>
      <ToggleButtonGroup
        bsSize="small"
        type="radio"
        name="sort_options"
        value={value}
        onChange={handleChange}
      >
        {options.map((o) => (
          <ToggleButton
            id={"sort_" + o.id}
            key={o.id}
            value={o.id}
            autoComplete="off"
            onClick={() => handleChange(o.id)}
          >
            {o.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
};

export default SortButtons;
