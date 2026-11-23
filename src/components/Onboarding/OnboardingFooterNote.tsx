import classnames from "classnames";
import Body2 from "components/SharedComponents/Typography/Body2";
import type { PropsWithChildren } from "react";
import React from "react";

import { useOnboardingCompact } from "./onboardingCompact";

// A line of text above an onboarding step's Continue button
const OnboardingFooterNote = ( { children }: PropsWithChildren ) => {
  const compact = useOnboardingCompact( );
  return (
    <Body2 className={classnames( "px-[6px]", compact
      ? "mb-3"
      : "mb-[24px]" )}
    >
      {children}
    </Body2>
  );
};

export default OnboardingFooterNote;
