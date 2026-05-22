import { useNavigation } from "@react-navigation/native";
// Directly imported, not from index.js to avoid circular dependency
import INatIcon from "components/SharedComponents/INatIcon";
// Directly imported, not from index.js to avoid circular dependency
import UserIcon from "components/SharedComponents/UserIcon";
import {
  Pressable, View,
} from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { PropsWithChildren } from "react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TextProps } from "react-native";
import User from "realmModels/User";
import { useInterval } from "sharedHooks";
import useCurrentUser from "sharedHooks/useCurrentUser";

const { useRealm } = RealmContext;

interface Props extends PropsWithChildren {
  user: {
    id: number;
    icon_url?: string;
    login: string;
  };
  isConnected: boolean;
  TextComponent: React.FC<TextProps>;
  testID: string;
  useBigIcon?: boolean;
}

const InlineUserBase = ( {
  user,
  isConnected,
  TextComponent,
  testID,
  useBigIcon = false,
}: Props ) => {
  const navigation = useNavigation();
  const userImgUri = User.thumbUri( user );
  const login = user?.login;
  const realm = useRealm();
  // eslint-disable-next-line arrow-body-style
  const [userHandle, setUserHandle] = useState( () => {
    return `${login} | ${realm.objects( "Observation" ).length}`;
  } );
  useInterval( () => {
    setUserHandle( `${login} | ${realm.objects( "Observation" ).length}` );
  }, 1000 );
  const currentUser = useCurrentUser();
  const isCurrentUser = user?.id === currentUser?.id;

  const { t } = useTranslation( );

  const renderUserIcon = () => {
    if ( !userImgUri || ( !isConnected && !isCurrentUser ) ) {
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
