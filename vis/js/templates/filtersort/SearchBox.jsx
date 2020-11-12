import React from "react";
import { Glyphicon } from "react-bootstrap";

const SearchBox = ({ placeholder, value, handleChange }) => {
  return (
    <div id="filter_container">
      <div className="input-group input-group-sm">
        <i className="fa fa-search searchfield-icon"></i>
        <input
          id="filter_input"
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
        />
        {value !== "" && (
          <Glyphicon
            id="searchclear"
            glyph="remove-circle"
            onClick={() => handleChange("")}
          />
        )}
      </div>
    </div>
  );
};

export default SearchBox;
