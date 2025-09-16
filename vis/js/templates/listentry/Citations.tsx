import React, { FC } from "react";
import { NotAvailable } from "../../types";

interface CitationsProps {
  number: number | NotAvailable;
  label: string;
}

const Citations: FC<CitationsProps> = ({ number, label }) => {
  return (
    <div className="list_readers">
      <span className="list_readers_entity">{label}</span>{" "}
      <span className="num_readers">{number}</span>&nbsp;
    </div>
  );
};

export default Citations;
