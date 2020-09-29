import React from "react";

const Backlink = ({ label, onClick, className = "backlink" }) => {
  return (
    // html template starts here
    <p id="backlink" className={className}>
      <a className="underline" onClick={onClick}>
        {label}
      </a>
    </p>
    // html template ends here
  );
};

export default Backlink;
