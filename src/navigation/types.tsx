/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/?config=dynamic
 */

import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RootStackParamList = {
  OnboardingStackNavigator: undefined;
  TabNavigator: undefined;
  NoBottomTabStackNavigator: undefined;
  LoginStackNavigator: undefined;
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
export type BottomTabParamList = {
  MenuTab: { initialRouteName: string };
  ExploreTab: { initialRouteName: string };
  ObservationsTab: { initialRouteName: string };
  NotificationsTab: { initialRouteName: string };
};

export type BottomTabProps = BottomTabScreenProps<BottomTabParamList>;

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
  UiLibraryItem: undefined;
  Log: undefined;
  ExploreTaxonSearch: undefined;
  ExploreLocationSearch: undefined;
  ExploreUserSearch: undefined;
  ExploreProjectSearch: undefined;
  Settings: undefined;
  About: undefined;
  Donate: undefined;
  Help: undefined;
};

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
