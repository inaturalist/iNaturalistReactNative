import type { ApiUser } from "api/types";
import type { ButtonConfiguration } from "components/SharedComponents/ButtonBar";
import ButtonBar from "components/SharedComponents/ButtonBar";
import SearchBar from "components/SharedComponents/SearchBar";
import SearchHeader from "components/SharedComponents/SearchHeader";
import Body1 from "components/SharedComponents/Typography/Body1";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import { Pressable, View } from "components/styledComponents";
import UserList from "components/UserList/UserList";
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { UserPojo } from "realmModels/User";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";
import useTranslation from "sharedHooks/useTranslation";
import useUserSearch from "sharedHooks/useUserSearch";
import { getShadow } from "styles/global";

import EmptySearchResults from "./EmptySearchResults";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
} );

export type ExploreSearchUser = ApiUser | UserPojo;

interface Props {
  closeModal: ( ) => void;
  updateUser: ( user: ExploreSearchUser | null, exclude?: boolean ) => void;
  onSelectUnobserved?: ( user: ExploreSearchUser ) => void;
}

const DEFAULT_ROW_CLASSES = "px-[15px] py-[11px] border-b border-lightGray";

const ExploreUserSearch = ( { closeModal, updateUser, onSelectUnobserved }: Props ) => {
  const [userQuery, setUserQuery] = useState( "" );
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets( );
  const currentUser = useCurrentUser();
  const { keyboardHeight, keyboardShown } = useKeyboardInfo();
  const { users: userList = [], isLoading, refetch } = useUserSearch( userQuery );

  // The picker shows default results instead of an empty list before the user
  // has typed anything
  const showDefaultResults = !!onSelectUnobserved && userQuery.trim( ).length === 0;

  const onUserSelected = useCallback( async ( user: ExploreSearchUser, exclude?: boolean ) => {
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

  const onUnobservedSelected = useCallback( ( ) => {
    if ( !currentUser || !onSelectUnobserved ) { return; }
    onSelectUnobserved( currentUser );
    closeModal();
  }, [closeModal, currentUser, onSelectUnobserved] );

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

  const keyboardPadding = keyboardShown
    ? bottom + keyboardHeight
    : bottom;

  const footerComponent = ( ) => (
    <>
      {showDefaultResults && currentUser && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t( "Species-I-havent-observed" )}
          className={DEFAULT_ROW_CLASSES}
          onPress={onUnobservedSelected}
          testID="ExploreUserSearch.unobserved"
        >
          <Body1>{t( "Species-I-havent-observed" )}</Body1>
        </Pressable>
      )}
      <View style={{ paddingBottom: keyboardPadding }} />
    </>
  );

  const buttons: ButtonConfiguration[] = [
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

  const defaultResults = currentUser
    ? [currentUser]
    : [];
  const users = showDefaultResults
    ? defaultResults
    : userList;

  return (
    <ViewWrapper>
      <SearchHeader
        onClose={closeModal}
        headerText={t( "SEARCH-USERS" )}
        onReset={resetUser}
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
        {currentUser && !onSelectUnobserved && (
          <ButtonBar
            buttonConfiguration={buttons}
            containerClass="justify-center pt-[15px]"
          />
        )}
      </View>
      <UserList
        ListEmptyComponent={emptyListComponent}
        ListFooterComponent={footerComponent}
        users={users}
        keyboardShouldPersistTaps="handled"
        accessibilityLabel={t( "Select-user" )}
        onPress={onUserSelected}
      />
    </ViewWrapper>
  );
};

export default ExploreUserSearch;
