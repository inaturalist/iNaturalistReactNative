import classnames from "classnames";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import type { PropsWithChildren } from "react";
import React from "react";

import { useOnboardingCompact } from "./onboardingCompact";

// The headline at the top of an onboarding step, a size smaller in compact mode
const OnboardingHeadline = ( { children }: PropsWithChildren ) => {
  const compact = useOnboardingCompact( );
  return (
    <Heading1
      accessibilityRole="header"
      // Android will clip an underline on the last line; the padding makes room
      // for it and the negative margin cancels the padding out
      className={classnames( "pb-[4px] -mb-[4px]", { "text-2xl": compact } )}
    >
      {children}
    </Heading1>
  );
};

export default OnboardingHeadline;
