// @flow

import { FlashList } from "@shopify/flash-list";
import fetchSearchResults from "api/search";
import {
  ActivityIndicator,
  Body3,
  Heading4,
  INatIconButton,
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import UserListItem from "components/SharedComponents/UserListItem";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadowForColor( colors.darkGray, {
  offsetHeight: 4
} );

type Props = {
  closeModal: Function,
  updateUser: Function
};

const ExploreUserSearch = ( { closeModal, updateUser }: Props ): Node => {
  const [userQuery, setUserQuery] = useState( "" );
  const { t } = useTranslation();

  // TODO: replace this with infinite scroll like ExploreFlashList
  const { data: userList, isLoading } = useAuthenticatedQuery(
    ["fetchSearchResults", userQuery],
    optsWithAuth => fetchSearchResults(
      {
        q: userQuery,
        sources: "users",
        fields: "user.id,user.login,user.icon_url,user.observations_count"
      },
      optsWithAuth
    )
  );

  const onUserSelected = useCallback( async user => {
    if ( !user.id && !user.login ) {
      // If both of those are missing, we can not query by user
      // TODO: user facing error message
      return;
    }
    updateUser( user );
    closeModal();
  }, [updateUser, closeModal] );

  const resetUser = useCallback(
    ( ) => {
      updateUser( null );
      closeModal();
    },
    [updateUser, closeModal]
  );

  const renderItem = useCallback(
    ( { item } ) => (
      <UserListItem
        item={{ user: item }}
        countText={t( "X-Observations", { count: item.observations_count } )}
        accessibilityLabel={t( "Select-user" )}
        onPress={( ) => onUserSelected( item )}
      />
    ),
    [onUserSelected, t]
  );

  // TODO: pagination like in ExploreFlashList ?

  const renderItemSeparator = () => (
    <View className="border-b border-lightGray" />
  );

  return (
    <ViewWrapper>
      <View className="flex-row justify-center p-5 bg-white">
        <INatIconButton
          testID="ExploreTaxonSearch.close"
          size={18}
          icon="back"
          className="absolute top-2 left-3 z-10"
          onPress={( ) => closeModal()}
          accessibilityLabel={t( "SEARCH-USERS" )}
        />
        <Heading4>{t( "SEARCH-USERS" )}</Heading4>
        <Body3 onPress={resetUser} className="absolute top-4 right-4">
          {t( "Reset-verb" )}
        </Body3>
      </View>
      <View
        className="bg-white px-6 pt-2 pb-8"
        style={DROP_SHADOW}
      >
        <SearchBar
          handleTextChange={setUserQuery}
          value={userQuery}
          testID="SearchUser"
        />
      </View>
      {isLoading
        ? (
          <View className="p-4">
            <ActivityIndicator size={40} />
          </View>
        )
        : (
          <FlashList
            ItemSeparatorComponent={renderItemSeparator}
            ListHeaderComponent={renderItemSeparator}
            accessible
            data={userList}
            estimatedItemSize={100}
            initialNumToRender={5}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={renderItem}
            testID="SearchUserList"
          />
        )}
    </ViewWrapper>
  );
};

export default ExploreUserSearch;
