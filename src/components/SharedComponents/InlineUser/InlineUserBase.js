// @flow

import { useNavigation } from "@react-navigation/native";
// Directly imported, not from index.js to avoid circular dependency
import INatIcon from "components/SharedComponents/INatIcon";
// Directly imported, not from index.js to avoid circular dependency
import UserIcon from "components/SharedComponents/UserIcon.tsx";
import {
  Pressable, View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import User from "realmModels/User.ts";

type Props = {
  user: {
    id: number,
    icon_url?: string,
    login: string
  },
  isConnected: boolean,
  TextComponent: ( props: {
    className?: string,
    numberOfLines?: number,
    ellipsizeMode?: string,
    selectable?: boolean,
    maxFontSizeMultiplier?: number,
    children?: React$Node, // eslint-disable-line no-undef
} ) => React$Node, // eslint-disable-line no-undef
  testID: string,
  useBigIcon?: boolean
};

const InlineUserBase = ( {
  user,
  isConnected,
  TextComponent,
  testID,
  useBigIcon = false
}: Props ): Node => {
  const navigation = useNavigation();
  const userImgUri = User.uri( user );
  const userHandle = user?.login;

  const { t } = useTranslation( );

  const renderUserIcon = () => {
    if ( !userImgUri || !isConnected ) {
      return (
        <INatIcon
          testID={`${testID}.FallbackPicture`}
          name="person"
          size={useBigIcon
            ? 32
            : 22}
        />
      );
    }
    return useBigIcon
      ? <UserIcon size={32} uri={userImgUri} />
      : <UserIcon uri={userImgUri} small />;
  };

  return (
    <Pressable
      testID={testID}
      className="flex flex-row items-center shrink"
      accessibilityRole="link"
      accessibilityLabel={t( "User", { userHandle } )}
      accessibilityHint={t( "Navigates-to-user-profile" )}
      onPress={() => {
        navigation.navigate( "UserProfile", { userId: user?.id } );
      }}
    >
      <View className="mr-[7px]">{renderUserIcon()}</View>
      <TextComponent
        className="w-3/4"
        numberOfLines={1}
        ellipsizeMode="tail"
        selectable
        maxFontSizeMultiplier={1}
      >
        {userHandle}
      </TextComponent>
    </Pressable>
  );
};

export default InlineUserBase;
