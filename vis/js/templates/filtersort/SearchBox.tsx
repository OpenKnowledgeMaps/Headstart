// @ts-nocheck
import React from "react";
import { Glyphicon } from "react-bootstrap";

import debounce from "../../utils/debounce";
import { trackMatomoEvent } from "../../utils/useMatomo";

// inspired by
// https://medium.com/@justintulk/debouncing-reacts-controlled-textareas-w-redux-lodash-4383084ca090
class DebouncedSearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };

    this.onChange = props.handleChange;
    this.onChangeDebounced = debounce(props.handleChange, 300);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(newValue) {
    this.setState({ value: newValue }, () => {
      this.onChangeDebounced(newValue);
    });
  }

  handleChangeImmediately(newValue) {
    this.setState({ value: newValue }, () => {
      this.onChange(newValue);
    });
  }

  render() {
    const { placeholder } = this.props;

    const handleClearSearch = () => {
      this.handleChangeImmediately("");
      trackMatomoEvent("List controls", "Clear search", "Search box");
    };

    return (
      // html template starts here
      <div id="filter_container">
        <div className="input-group input-group-sm">
          <i className="fa fa-search searchfield-icon"></i>
          <input
            id="filter_input"
            type="text"
            className="form-control"
            placeholder={placeholder}
            value={this.state.value}
            onChange={(e) => this.handleChange(e.target.value)}
          />
          {this.state.value !== "" && (
            <Glyphicon
              id="searchclear"
              glyph="remove-circle"
              onClick={handleClearSearch}
            />
          )}
        </div>
      </div>
      // html template ends here
    );
  }
}

export default DebouncedSearchBox;
