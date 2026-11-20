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
      className={compact
        ? "text-2xl"
        : undefined}
    >
      {children}
    </Heading1>
  );
};

export default OnboardingHeadline;
