import React, { FC } from "react";
import { NotAvailable } from "../../types";

interface CitationsProps {
  number: number | NotAvailable;
  label: string;
}

const Citations: FC<CitationsProps> = ({ number, label }) => {
  return (
    <div className="list_readers">
      <span>{number}</span> <span className="list_readers_entity">{label}</span>
    </div>
  );
};

export default Citations;
