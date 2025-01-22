import React from "react";

const Coordinates = ({ x, y }) => {
  return (
    <h5>
      Coordinates: X={x.toFixed(2)}, Y={y.toFixed(2)}
    </h5>
  );
};

export default Coordinates;

