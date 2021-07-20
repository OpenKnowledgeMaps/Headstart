import React from "react";

import Highlight from "../../components/Highlight";

const Comments = ({ items }) => {
  return (
    // html template starts here
    <div id="list_comments" className="comments">
      {items
        .filter((c) => !!c.comment)
        .map((comment) => (
          <Comment key={comment.comment} text={comment.comment} />
        ))}
    </div>
    // html template ends here
  );
};

export default Comments;

const Comment = ({ text }) => {
  const parts = text.split(/:/);
  let label = "";
  let content = "";
  if (parts.length > 1) {
    label = parts[0] + ":";
    content = parts.slice(1).join(":");
  } else {
    label = "";
    content = text;
  }

  return (
    <div id="list_comment" className="comments">
      <div className="comment-text">
        <span id="comment">
          <span className="comment-label">{label}</span>
          <Highlight>{content}</Highlight>
        </span>
      </div>
    </div>
  );
};
