import React from "react";

import Heading from "../components/Heading";
import Backlink from "../components/Backlink";
import ContextLine from "../components/ContextLine";

class SubdisciplineTitle extends React.Component {
  render() {
    return (
      <>
        <div id="subdiscipline_title" style={{ position: "relative" }}>
          {/* <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#F1F1F1',
              overflow: 'hidden'
            }}>
              <i className="fas fa-user" style={{
                color: '#818181',
                fontSize: '38px'
              }}></i>
            </div>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}> */}
            <Heading />
            <Backlink />
            <ContextLine popoverContainer={this} />
          {/* </div> */}
        </div>
      </>
    );
  }
}

export default SubdisciplineTitle;