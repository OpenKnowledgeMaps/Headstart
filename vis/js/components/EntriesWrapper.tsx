import React from "react";
import { connect } from "react-redux";

export interface EntriesWrapperProps {
  height?: number;
  children: React.ReactNode;
}

const EntriesWrapper = ({ height, children }: EntriesWrapperProps) => {
  return (
    <div
      className="col-xs-12"
      id="papers_list"
      style={{ display: "block", height: height ? height : undefined }}
    >
      {children}
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  height: state.list.height,
});

export default connect(mapStateToProps)(EntriesWrapper);
