// @flow

import {
  Button
} from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

type Props = {
    following: boolean,
    follow: Function,
    unfollow: Function,
    loading: boolean
  };

const FollowButton = ( {
  following, follow, unfollow, loading
}: Props ): Node => {
  if ( following ) {
    return (
      <Button
        level="neutral"
        className="grow"
        text={t( "UNFOLLOW" )}
        onPress={unfollow}
        testID="UserProfile.unfollowButton"
      />
    );
  }
  return (
    <Button
      level="primary"
      className="grow"
      loading={loading}
      text={t( "FOLLOW" )}
      onPress={follow}
      testID="UserProfile.followButton"
    />

  );
};

export default FollowButton;
