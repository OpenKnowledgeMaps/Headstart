import React from "react";
import { connect } from "react-redux";

import { changeFile, openInfoModal } from "../actions";

const ZoomedOutHeading = ({
  children: title,
  infoButton,
  filesDropdown,
  onInfoClick,
  onFileChange,
}) => {
  return (
    // html template starts here
    <div className="heading-container">
      <h4 className="heading">{title}</h4>
      <h4 className="features">
        {infoButton.show && (
          <button id="infolink">
            <span id="whatsthis">
              <i
                className="fas fa-info-circle"
                style={{ fontStyle: "normal" }}
                onClick={onInfoClick}
              ></i>
            </span>{" "}
          </button>
        )}
        {filesDropdown.show && (
          <>
            {" "}
            Select dataset:{" "}
            <select
              id="datasets"
              value={filesDropdown.files.current}
              onChange={(e) => onFileChange(parseInt(e.target.value))}
            >
              {filesDropdown.files.list.map((entry, index) => (
                <option key={entry.file} value={index}>
                  {entry.title}
                </option>
              ))}
            </select>
          </>
        )}
      </h4>
    </div>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  infoButton: {
    show: !state.contextLine.show,
  },
  filesDropdown: {
    show: state.heading.showDropdown,
    files: state.files,
  },
});

const mapDispatchToProps = (dispatch) => ({
  onInfoClick: () => dispatch(openInfoModal()),
  onFileChange: (fileIndex) => dispatch(changeFile(fileIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ZoomedOutHeading);
