import React from "react";


const Coordinates = ({valueX, valueY}) => {

    // // function for formatting coordinates to ddd.dd (example 0.73 -> 000.73)
    // function addZero(number){
    //     const maxLength = 6
    //     let numberStr = String(number.toFixed(2))
    //     if (numberStr.includes('-')) {
    //        return `-${numberStr.replace('-','').padStart(maxLength, '0')}`
    //     }
    //     return numberStr.padStart(maxLength, '0')
    // }

    return (
        // html template starts here
        <div className="coordinates">
      <span>
        Coordinates: X={(valueX).toFixed(2)}, Y={(valueY).toFixed(2)}
        {/*Coordinates: X={addZero(valueX)}, Y={addZero(valueY)}*/}
      </span>
        </div>
        // html template ends here
    );
};

export default Coordinates;
