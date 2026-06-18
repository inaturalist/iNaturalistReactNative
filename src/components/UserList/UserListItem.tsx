import classnames from "classnames";
import CompositeListItem from "components/SharedComponents/CompositeListItem/CompositeListItem";
import INatIcon from "components/SharedComponents/INatIcon";
import UserIcon from "components/SharedComponents/UserIcon";
import { View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React from "react";
import User from "realmModels/User";
import { useTranslation } from "sharedHooks";

type IconVariant = "mention" | "medium";

interface Props extends PropsWithChildren {
  item: object;
  countText?: string;
  onPress?: ( ) => void;
  accessibilityLabel?: string;
  pressable?: boolean;
  iconVariant?: IconVariant;
  className?: string;
}

const ICON_VARIANT_SIZE: Record<IconVariant, number> = {
  mention: 40,
  medium: 62,
};

interface UserListItemContextValue {
  user: { id?: number; login?: string; icon_url?: string } | undefined;
  countText: string;
  iconVariant: IconVariant;
}

const UserListItemContext = React.createContext<UserListItemContextValue | undefined>(
  undefined,
);

function useUserListItem( ): UserListItemContextValue {
  const context = React.useContext( UserListItemContext );
  if ( context === undefined ) {
    throw new Error( "UserListItem subcomponents must be used within a UserListItem" );
  }
  return context;
}

// Avatar: the user's icon, or a person placeholder when there's no icon.
const UserListItemUserIcon = ( ) => {
  const { user, iconVariant } = useUserListItem( );
  return user?.icon_url
    ? (
      <UserIcon
        uri={User.uri( user )}
        medium={iconVariant === "medium"}
      />
    )
    : (
      <INatIcon
        name="person"
        size={ICON_VARIANT_SIZE[iconVariant]}
      />
    );
};

// First line: the user's login.
const UserListItemUserName = ( ) => {
  const { user } = useUserListItem( );
  if ( !user?.login ) { return null; }
  return (
    <CompositeListItem.PrimaryText>
      { user.login }
    </CompositeListItem.PrimaryText>
  );
};

// Second line: the observation/identification count text.
const UserListItemUserObservations = ( ) => {
  const { countText } = useUserListItem( );
  if ( !countText ) { return null; }
  return (
    <CompositeListItem.SecondaryText>
      { countText }
    </CompositeListItem.SecondaryText>
  );
};

const UserListItem = ( {
  item,
  countText = "",
  onPress,
  accessibilityLabel: accessibilityLabelProp,
  pressable = true,
  iconVariant = "medium",
  className,
  children,
}: Props ) => {
  const { t } = useTranslation( );
  const user = item?.user;

  const contextValue = React.useMemo(
    ( ) => ( { user, countText, iconVariant } ),
    [user, countText, iconVariant],
  );

  return (
    <UserListItemContext.Provider value={contextValue}>
      <CompositeListItem
        pressable={pressable}
        onPress={onPress}
        accessibilityLabel={accessibilityLabelProp || t( "Navigates-to-user-profile" )}
        accessibilityRole={onPress
          ? "button"
          : "link"}
        className={classnames( pressable && "mx-3 my-2", className )}
        testID={`UserProfile.${user?.id}`}
      >
        { children || (
          <View className="flex-row items-center w-5/6">
            <UserListItem.UserIcon />
            <UserListItem.TextSection>
              <UserListItem.UserName />
              <UserListItem.UserObservations />
            </UserListItem.TextSection>
          </View>
        ) }
      </CompositeListItem>
    </UserListItemContext.Provider>
  );
};

UserListItem.UserIcon = UserListItemUserIcon;
UserListItem.UserName = UserListItemUserName;
UserListItem.UserObservations = UserListItemUserObservations;
UserListItem.TextSection = CompositeListItem.TextSection;

export default UserListItem;
