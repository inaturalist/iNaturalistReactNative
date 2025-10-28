import { useNavigation } from "@react-navigation/native";
import {
  CustomFlashList
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import UserListItem from "components/UserList/UserListItem";
import _ from "lodash";
import React from "react";
import { ViewStyle } from "react-native";
import { useTranslation } from "sharedHooks";

const CONTAINER_STYLE = {
  backgroundColor: "white"
};

interface Props {
  ListEmptyComponent?: React.JSX.Element
  ListFooterComponent?: React.JSX.Element
  onEndReached?: ( ) => void
  refreshing?: boolean
  users: Array<object>
  onPress?: ( ) => void
  accessibilityLabel?: string
  keyboardShouldPersistTaps?: string
  contentContainerStyle?: ViewStyle
}

const UserList = ( {
  ListEmptyComponent,
  ListFooterComponent,
  onEndReached,
  refreshing,
  users,
  onPress,
  accessibilityLabel,
  keyboardShouldPersistTaps,
  contentContainerStyle
}: Props ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  const renderItem = ( { item } ) => {
    // results in explore search are nested differently
    // than in project members at the moment
    const userItem = _.has( item, "user" )
      ? item
      : { user: item };
    const observationCount = item?.observation_count || item?.observations_count;
    return (
      <UserListItem
        item={userItem}
        countText={
          item?.count
            ? t( "X-Identifications", { count: item?.count } )
            : t( "X-Observations", { count: observationCount } )
        }
        onPress={( ) => {
          if ( onPress ) {
            onPress( item );
          } else {
            navigation.navigate( "UserProfile", { userId: userItem?.user?.id } );
          }
        }}
        accessibilityLabel={accessibilityLabel}
      />
    );
  };

  const renderItemSeparator = ( ) => <View className="border-b border-lightGray" />;

  return (
    <CustomFlashList
      ItemSeparatorComponent={renderItemSeparator}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={contentContainerStyle || CONTAINER_STYLE}
      data={users}
      keyExtractor={item => item?.user?.id || item?.id}
      onEndReached={onEndReached}
      refreshing={refreshing}
      renderItem={renderItem}
      testID="UserList"
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
    />
  );
};

export default UserList;
