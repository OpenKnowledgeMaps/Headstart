import React, { FC, ReactNode } from "react";

interface ContextLineTemplateProps {
  children: ReactNode;
}

export const ContextLineTemplate: FC<ContextLineTemplateProps> = ({
  children,
}) => (
  <p id="context" data-testid="context">
    {children}
  </p>
);
