// @flow

import BottomSheet from "components/SharedComponents/BottomSheet";
import type { Node } from "react";
import React from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";

import LoginPrompt from "./LoginPrompt";

type Props = {
  hasScrolled: boolean
}

const ObsListBottomSheet = ( { hasScrolled }: Props ): Node => {
  const currentUser = useCurrentUser( );

  if ( !currentUser ) {
    return (
      <BottomSheet hide={hasScrolled}>
        <LoginPrompt />
      </BottomSheet>
    );
  }

  return null;
};

export default ObsListBottomSheet;
