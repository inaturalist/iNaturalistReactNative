import classnames from "classnames";
import { Heading1, Heading2 } from "components/SharedComponents";
import { fontMonoClass, Text } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React from "react";

export const H1 = ( { children }: PropsWithChildren ) => (
  <Heading1 className="mt-3 mb-2">
    {children}
  </Heading1>
);
export const H2 = ( { children }: PropsWithChildren ) => (
  <Heading2 className="mt-3 mb-2">
    {children}
  </Heading2>
);
export const P = ( { children }: PropsWithChildren ) => (
  <Text selectable className="mb-2">
    {children}
  </Text>
);

interface CODEProps extends PropsWithChildren {
  optionalClassName?: string;
}
export const CODE = ( { children, optionalClassName }: CODEProps ) => (
  <Text
    selectable
    className={classnames(
      fontMonoClass,
      optionalClassName,
    )}
  >
    {children}
  </Text>
);
