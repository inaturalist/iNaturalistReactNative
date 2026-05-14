import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { TabStackScreenProps } from "navigation/types";
import React, {
  useEffect,
  useMemo,
} from "react";
import {
  useTranslation,
} from "sharedHooks";

const Journal = ( ) => {
  const navigation = useNavigation <TabStackScreenProps<"Journal">["navigation"]>( );
  const { params } = useRoute( );
  const { userLogin, journalPostsCount } = params;
  const { t } = useTranslation( );

  const followersHeaderOptions = useMemo(
    () => ( {
      headerTitle: userLogin,
      headerSubtitle: t( "X-FOLLOWERS", {
        count: journalPostsCount,
      } ),
    } ),
    [journalPostsCount, t, userLogin],
  );

  useEffect( ( ) => {
    navigation.setOptions( followersHeaderOptions );
  }, [followersHeaderOptions, navigation] );

  return (
    <ViewWrapper useTopInset={false}>
      <View className="border-b border-lightGray mt-5" />
    </ViewWrapper>
  );
};

export default Journal;
