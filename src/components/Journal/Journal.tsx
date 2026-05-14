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
  const navigation = useNavigation<TabStackScreenProps<"Journal">["navigation"]>( );
  const { params } = useRoute<TabStackScreenProps<"Journal">["route"]>( );
  const { journalPostsCount, projectTitle, userLogin } = params;
  const { t } = useTranslation( );

  const headerOptions = useMemo(
    () => ( {
      headerTitle: userLogin || projectTitle,
      headerSubtitle: t( "X-JOURNAL_POSTS", {
        count: journalPostsCount,
      } ),
    } ),
    [journalPostsCount, t, userLogin, projectTitle],
  );

  useEffect( ( ) => {
    navigation.setOptions( headerOptions );
  }, [headerOptions, navigation] );

  return (
    <ViewWrapper useTopInset={false}>
      <View className="border-b border-lightGray mt-5" />
    </ViewWrapper>
  );
};

export default Journal;
