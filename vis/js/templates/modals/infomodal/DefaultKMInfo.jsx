import React from "react";
import StandardKMInfo from "./subcomponents/StandardKMInfo";
import TomeggKMInfo from "./subcomponents/TomeggKMInfo";

const DefaultKMInfo = ({ params }) => {
  
  let Component;
  
  switch(params.service) {
    case 'tomegg': Component = TomeggKMInfo; break;
    default: Component = StandardKMInfo; break;
  }

  return (
    // html template starts here
    <Component params={params} />
    // html template ends here
  );
};

export default DefaultKMInfo;
