/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/?config=dynamic
 */

import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
  ParamListRoute,
} from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type SharedStackParamList = {
  // From usePrepareStoreAndNavigate.ts
  // {
  //   entryScreen: "Camera";
  // }
  // From usePrepareStoreAndNavigate.ts
  // {
  //   entryScreen: "CameraWithDevice";
  //   lastScreen: "CameraWithDevice";
  // }
  // From PhotoLibrary
  // {
  //   lastScreen: "PhotoLibrary";
  // }
  // From AddObsButton
  // {
  //   previousScreen: ParamListRoute<RootStackParamList>;
  // };
  // From useNavigateWithTaxonSelected.ts
  // { lastScreen: "Suggestions" }
  // From useNavigateToObsEdit.ts
  // { lastScreen: "Match" }
  // From useBackPress.ts; SoundRecorder.js; useNavigateWithTaxonSelected.ts; TaxonDetails.js
  // undefined
  ObsEdit: {
    lastScreen?: "Camera" | "CameraWithDevice" | "PhotoLibrary" | "Suggestions" | "Match";
    entryScreen?: "CameraWithDevice";
    // eslint-disable-next-line no-use-before-define
    previousScreen?: ParamListRoute<RootStackParamList>;
  } | undefined;
  LocationPicker: undefined;
  TaxonDetails: undefined;
  PhotoSharing: undefined;
  // From usePrepareStoreAndNavigate.ts
  // {
  //   entryScreen: "CameraWithDevice";
  //   lastScreen: "CameraWithDevice";
  // }
  // From PhotoLibrary
  // {
  //   lastScreen: "PhotoLibrary";
  // }
  Match: {
    entryScreen?: "CameraWithDevice";
    lastScreen: "CameraWithDevice" | "PhotoLibrary";
  };
  // From usePrepareStoreAndNavigate.ts
  // {
  //   entryScreen: "CameraWithDevice";
  //   lastScreen: "CameraWithDevice";
  // }
  // From IdentificationSection.js
  // {
  //   entryScreen: "ObsEdit";
  //   lastScreen: "ObsEdit";
  //   hideSkip: boolean;
  // }
  // From ObsEditHeader
  // {
  //   lastScreen: "ObsEdit";
  // }
  // From PhotoLibrary
  // {
  //   lastScreen: "PhotoLibrary";
  // }
  // From useObsDetailsSharedLogic.ts
  // {
  //   entryScreen: "ObsDetails",
  //   lastScreen: "ObsDetails",
  //   hideSkip: true,
  // }
  Suggestions: {
    entryScreen?: "CameraWithDevice" | "ObsEdit" | "ObsDetails";
    lastScreen?: "CameraWithDevice" | "ObsEdit" | "PhotoLibrary" | "ObsDetails";
    hideSkip?: boolean;
  };
  SuggestionsTaxonSearch: {
    entryScreen: "ObsEdit";
    lastScreen: "ObsEdit";
  };
  MatchTaxonSearchScreen: undefined;
  FullPageWebView: undefined;
};

// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type OnboardingStackParamList = {
  Onboarding: undefined;
};

// Tab-only routes (not from SharedStackScreens). Intersected with SharedStackParamList
// so TabStackParamList matches TabStackNavigator + SharedStackScreens.
// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type BaseTabStackParamList = {
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

export type TabStackParamList = BaseTabStackParamList & SharedStackParamList;

// Params for TabStackNavigator when hosted inside BottomTabNavigator, including which
// inner stack screen should be shown first (see BottomTabNavigator initialParams).
interface TabParams {
  initialRouteName: keyof BaseTabStackParamList;
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

// Camera / import flow only; shared screens come from SharedStackScreens.
// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type BaseNoBottomTabStackParamList = {
  // PhotoLibrary param options:
  // Being set on PhotoLibrary:
  // {
  //   fromGroupPhotos: false;
  // }
  // From GroupPhotos
  // {
  //   fromGroupPhotos: true;
  // }
  // From PhotoLibraryIcon
  // {
  //   cmonBack: true;
  //   lastScreen: "Camera";
  //   fromAICamera: true;
  // }
  // From AddEvidenceSheet
  // {
  //   skipGroupPhotos: true;
  // }
  // From AddObsButton
  // {
  //   previousScreen: ParamListRoute<RootStackParamList>;
  // };
  PhotoLibrary: {
    fromGroupPhotos?: boolean;
    cmonBack?: boolean;
    lastScreen?: "Camera";
    fromAICamera?: boolean;
    skipGroupPhotos?: boolean;
    // eslint-disable-next-line no-use-before-define
    previousScreen?: ParamListRoute<RootStackParamList>;
  };
  // From AddObsButton
  // {
  //   previousScreen: ParamListRoute<RootStackParamList>;
  // };
  // From MyObservationsEmptySimple.js
  // { camera: "AI" }
  // From AddEvidenceSheet.js
  // {
  //   addEvidence: true,
  //   camera: "Standard",
  // }
  Camera: {
    addEvidence?: boolean;
    camera?: "AI" | "Standard";
    // eslint-disable-next-line no-use-before-define
    previousScreen?: ParamListRoute<RootStackParamList>;
  };
  GroupPhotos: undefined;
  SoundRecorder: undefined;
};

export type NoBottomTabStackParamList = BaseNoBottomTabStackParamList &
  SharedStackParamList;

// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type LoginStackParamList = {
  Login: {
    emailConfirmed?: boolean;
    prevScreen?: string;
    projectId?: number;
  };
  SignUp: undefined;
  ForgotPassword: undefined;
  LearnMore: undefined;
  SignUpConfirmation: {
    user: {
      email: string;
    };
  };
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

export type OnboardingStackScreenProps<T extends keyof OnboardingStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<OnboardingStackParamList, T>,
    RootStackScreenProps
  >;

export type BottomTabProps =
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList>,
    RootStackScreenProps
  >;

export type TabStackScreenProps<T extends keyof TabStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<TabStackParamList, T>,
    BottomTabProps
  >;

export type NoBottomTabStackScreenProps<T extends keyof NoBottomTabStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<NoBottomTabStackParamList, T>,
    RootStackScreenProps
  >;

export type LoginStackScreenProps<T extends keyof LoginStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<LoginStackParamList, T>,
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
