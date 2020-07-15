import React from "react";

const Backlink = ({ label, onClick }) => {
  return (
    // html template starts here
    <p id="backlink" className="backlink">
      <a className="underline" onClick={onClick}>
        {label}
      </a>
    </p>
    // html template ends here
  );
};

export default Backlink;
