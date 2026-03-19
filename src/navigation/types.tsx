/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/?config=dynamic
 */

import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type SharedStackParamList = {
  ObsEdit: undefined;
  LocationPicker: undefined;
  TaxonDetails: undefined;
  PhotoSharing: undefined;
  Match: undefined;
  Suggestions: undefined;
  SuggestionsTaxonSearch: undefined;
  MatchTaxonSearchScreen: undefined;
  FullPageWebView: undefined;
};

// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type OnboardingStackParamList = {
  Onboarding: undefined;
};

// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type TabStackParamList = {
  Menu: undefined;
  ObsList: undefined;
  RootExplore: undefined;
  Explore: undefined;
  ExploreFilters: undefined;
  ExploreSearch: undefined;
  ObsDetails: undefined;
  Notifications: undefined;
  UserProfile: undefined;
  DataQualityAssessment: undefined;
  Projects: undefined;
  ProjectDetails: undefined;
  ProjectRequirements: undefined;
  ProjectMembers: undefined;
  ProjectList: undefined;
  FollowersList: undefined;
  FollowingList: undefined;
  Debug: undefined;
  UILibrary: undefined;
  UiLibraryItem: undefined;
  Log: { isLegacyLogs: boolean };
  Settings: undefined;
  About: undefined;
  Donate: undefined;
  Help: undefined;
};

// Params for TabStackNavigator when hosted inside BottomTabNavigator, including which
// inner stack screen should be shown first (see BottomTabNavigator initialParams).
interface TabParams {
  initialRouteName: keyof TabStackParamList;
}

// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type BottomTabParamList = {
  MenuTab: NavigatorScreenParams<TabStackParamList> & TabParams;
  ExploreTab: NavigatorScreenParams<TabStackParamList> & TabParams;
  ObservationsTab: NavigatorScreenParams<TabStackParamList> & TabParams;
  NotificationsTab: NavigatorScreenParams<TabStackParamList> & TabParams;
};

// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type NoBottomTabStackParamList = {
  Camera: undefined;
  PhotoLibrary: undefined;
  GroupPhotos: undefined;
  SoundRecorder: undefined;
  ObsEdit: undefined;
};

// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type LoginStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  LearnMore: undefined;
  SignUpConfirmation: undefined;
  FullPageWebView: undefined;
};

// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RootStackParamList = {
  OnboardingStackNavigator: NavigatorScreenParams<OnboardingStackParamList>;
  TabNavigator: NavigatorScreenParams<BottomTabParamList>;
  NoBottomTabStackNavigator: NavigatorScreenParams<NoBottomTabStackParamList>;
  LoginStackNavigator: NavigatorScreenParams<LoginStackParamList>;
};

export type RootStackScreenProps = NativeStackScreenProps<RootStackParamList>;

export type OnboardingStackScreenProps = CompositeScreenProps<
  NativeStackScreenProps<OnboardingStackParamList>,
  RootStackScreenProps
>;

export type BottomTabProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList>,
  RootStackScreenProps
>;

export type TabStackScreenProps = CompositeScreenProps<
  NativeStackScreenProps<TabStackParamList>,
  BottomTabProps
>;

export type NoBottomTabStackScreenProps = CompositeScreenProps<
  NativeStackScreenProps<NoBottomTabStackParamList>,
  RootStackScreenProps
>;

export type LoginStackScreenProps = CompositeScreenProps<
  NativeStackScreenProps<LoginStackParamList>,
  RootStackScreenProps
>;

// https://reactnavigation.org/docs/typescript/?config=dynamic#specifying-default-types-for-usenavigation-link-ref-etc
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
