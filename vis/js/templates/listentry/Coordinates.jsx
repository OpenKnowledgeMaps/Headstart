import React from "react";
export default function Coordinates({x, y}) {

    const formattedX = x.toFixed(2);
    const formattedY = y.toFixed(2);
    return (
        <div className="list_coordinates">
            <span>Coordinates: X={formattedX}, Y={formattedY}</span>
        </div>
    );
}