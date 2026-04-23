import React, { FC } from "react";

interface PaperCountProps {
  value: number;
  label: string;
}

const PaperCount: FC<PaperCountProps> = ({ value, label }) => (
  <span id="context-paper_count" className="context_item">
    {value} {label}
  </span>
);

export default PaperCount;
