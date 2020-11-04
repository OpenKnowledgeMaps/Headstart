import React from "react";

/**
 * Template for the metadata quality context line item.
 * @param {Object} props contain: 
 *     - label: any text description
 *     - quality: either 'low' or 'high'
 */
const MetadataQuality = (props) => {
  const { label, quality } = props;

  let metadataClass = "";
  if (quality === "low") {
    metadataClass = "context_metadata_low";
  }
  if (quality === "high") {
    metadataClass = "context_metadata_high";
  }

  return (
    // html template starts here
    <span className={`context_moreinfo ${metadataClass}`} {...props}>
      {label}
    </span>
    // html template ends here
  );
};

export default MetadataQuality;
