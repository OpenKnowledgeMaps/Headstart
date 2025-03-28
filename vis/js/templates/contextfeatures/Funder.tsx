import React from "react";

const Funder = ({ children }: {
  children: React.ReactNode;
}) => {
  return (
    // html template starts here
    <span id="context-funder" className="context_item">
      Funder: {children}
    </span>
    // html template ends here
  );
};

export default Funder;
