import React from "react";

const Error = () => {
  return (
    <div className="export-error">
      <p>
        <strong className="hs-strong">
          Unfortunately we were unable to create a file.
        </strong>
      </p>
      <p>
        It seems that your Internet is unavailable or the connection was reset.{" "}
        <strong className="hs-strong">
          Please check you Internet settings and try again by refreshing this
          page.
        </strong>
      </p>
      <p>
        If the error persists, please let us know at{" "}
        <a href="mailto:info@openknowledgemaps.org">
          info@openknowledgemaps.org
        </a>
        . We will investigate this issue further.
      </p>
    </div>
  );
};

export default Error;
