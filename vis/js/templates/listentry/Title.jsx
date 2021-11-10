import React from "react";

import Highlight from "../../components/Highlight";
import useMatomo from "../../utils/useMatomo";

const Title = ({ children, onClick }) => {
  const { trackEvent } = useMatomo();

  const handleClick = () => {
    onClick();
    trackEvent("List document", "Select paper", "List title");
  };

  return (
    // html template starts here
    <div className="list_title" onClick={handleClick}>
      <a id="paper_list_title">
        <Highlight queryHighlight>{children}</Highlight>
      </a>
    </div>
    // html template ends here
  );
};

export default Title;
