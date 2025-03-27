// @ts-nocheck

import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import Highlight from "../../components/Highlight";

const Comments = ({ items }) => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <div id="list_comments" className="comments">
      {items.map((comment) => (
        <div key={comment.comment} id="list_comment" className="comments">
          <span>
            <i className="fa fa-comment"></i>
          </span>
          <div className="comment-text">
            <span id="comment">
              <Highlight>{`"${comment.comment}" `}</Highlight>
            </span>
            {!!comment.author && (
              <>
                <span id="comment-by-label">
                  {localization.comment_by_label}
                </span>{" "}
                <span id="comment-author" className="comment-author">
                  <Highlight>{comment.author}</Highlight>
                </span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
    // html template ends here
  );
};

export default Comments;
