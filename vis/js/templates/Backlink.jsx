import React from "react";

const Backlink = ({ label, onClick }) => {
  return (
    <p id="backlink" className="backlink">
      <a className="underline" onClick={onClick}>
        {label}
      </a>
    </p>
  );
};

export default Backlink;
