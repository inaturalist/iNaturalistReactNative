// @flow

import {
  ButtonBar,
  SearchBar,
  ViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import UserList from "components/UserList/UserList";
import type { Node } from "react";
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  useCurrentUser, useKeyboardInfo, useTranslation, useUserSearch,
} from "sharedHooks";
import { getShadow } from "styles/global";

import EmptySearchResults from "./EmptySearchResults";
import ExploreSearchHeader from "./ExploreSearchHeader";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
} );

type Props = {
  closeModal: Function,
  updateUser: Function
};

const ExploreUserSearch = ( { closeModal, updateUser }: Props ): Node => {
  const [userQuery, setUserQuery] = useState( "" );
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const { keyboardHeight, keyboardShown } = useKeyboardInfo();
  const { users: userList = [], isLoading, refetch } = useUserSearch( userQuery );

  const onUserSelected = useCallback( async ( user, exclude ) => {
    if ( !user.id && !user.login ) {
      // If both of those are missing, we can not query by user
      // TODO: user facing error message
      return;
    }
    updateUser( user, exclude );
    closeModal();
  }, [updateUser, closeModal] );

  const resetUser = useCallback(
    ( ) => {
      updateUser( null );
      closeModal();
    },
    [updateUser, closeModal],
  );

  // TODO: pagination like in ExploreFlashList ?

  const emptyListComponent = useMemo(
    ( ) => (
      <EmptySearchResults
        isLoading={isLoading}
        searchQuery={userQuery}
        refetch={refetch}
      />
    ),
    [isLoading, refetch, userQuery],
  );

  const footerComponent = useMemo(
    ( ) => ( keyboardShown && keyboardHeight > 0
      ? <View style={{ height: keyboardHeight }} />
      : null ),
    [keyboardHeight, keyboardShown],
  );

  const buttons = [
    {
      title: t( "BY-ME" ),
      onPress: () => {
        if ( currentUser ) {
          onUserSelected( currentUser );
        }
      },
      isPrimary: false,
      className: "w-1/2 mx-2",
    },
    {
      title: t( "NOT-BY-ME" ),
      onPress: () => {
        if ( currentUser ) {
          onUserSelected( currentUser, true );
        }
      },
      isPrimary: false,
      className: "w-1/2 mx-2",
    },
  ];

  return (
    <ViewWrapper>
      <ExploreSearchHeader
        closeModal={closeModal}
        headerText={t( "SEARCH-USERS" )}
        resetFilters={resetUser}
        testID="ExploreUserSearch.close"
      />
      <View
        className="bg-white px-6 pt-2 pb-5"
        style={DROP_SHADOW}
      >
        <SearchBar
          handleTextChange={setUserQuery}
          value={userQuery}
          testID="SearchUser"
        />
        {currentUser && (
          <ButtonBar
            buttonConfiguration={buttons}
            containerClass="justify-center pt-[15px]"
          />
        )}
      </View>
      <UserList
        ListEmptyComponent={emptyListComponent}
        ListFooterComponent={footerComponent}
        users={userList}
        keyboardShouldPersistTaps="handled"
        accessibilityLabel={t( "Select-user" )}
        onPress={onUserSelected}
      />
    </ViewWrapper>
  );
};

export default ExploreUserSearch;
