import React from "react";

const DocumentTypesSimple = ({ label, text }) => {
  return (
    // html template starts here
    <span id="document_types">
      {label}: {text}
    </span>
    // html template ends here
  );
};

export default DocumentTypesSimple;
