import React from "react";

interface CitationsProps {
  number: number;
  label: string;
}

const Citations = ({ number, label }: CitationsProps) => {
  return (
    // html template starts here
    <div className="list_readers">
      <span className="list_readers_entity">{label}</span> <span>{number}</span>
      &nbsp;
    </div>
    // html template ends here
  );
};

export default Citations;
