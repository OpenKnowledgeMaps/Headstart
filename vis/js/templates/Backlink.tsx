import React from "react";

export interface BackLinkProps {
  label: string;
  onClick: () => void;
  className?: string;
}

const BackLink = ({ label, onClick, className = "backlink" }: BackLinkProps) => {
  return (
    <p id="backlink" className={className}>
      <a className="underline" onClick={onClick}>
        {label}
      </a>
    </p>
  );
};

export default BackLink;
