import {
  Button
} from "components/SharedComponents";
import { t } from "i18next";
import React from "react";

interface Props {
    following: boolean;
    follow: () => void;
    unfollow: () => void;
    loading: boolean;
}

const FollowButton = ( {
  following, follow, unfollow, loading
}: Props ) => {
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
