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
import type { ApiPlace, ApiUser } from "api/types";

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
  // From PhotoSharing
  // { lastScreen: "PhotoSharing" }
  // From GroupPhotosContainer
  // { lastScreen: "GroupPhotos" }
  // {
  //   entryScreen: "GroupPhotos",
  //   lastScreen: "GroupPhotos",
  // }
  // From useBackPress.ts; SoundRecorder.js; useNavigateWithTaxonSelected.ts; TaxonDetails.js
  // undefined
  ObsEdit: {
    lastScreen?: "Camera" |
      "CameraWithDevice" |
      "PhotoLibrary" |
      "Suggestions" |
      "Match" |
      "PhotoSharing" |
      "GroupPhotos";
    entryScreen?: "CameraWithDevice" | "GroupPhotos";
    // eslint-disable-next-line no-use-before-define
    previousScreen?: ParamListRoute<RootStackParamList>;
  } | undefined;
  // From MatchContainer
  // undefined
  LocationPicker: undefined;
  // From ExploreSearchContainer, ExploreTaxonSearchModal, MyObservationsSimple,
  // ObsDetailsOverview, CommunityTaxon, SavedMatchContainer, ActivityItem, ProjectRequirements
  // TaxonGridItem
  // { id: taxon.id }
  // From MatchContainer
  // {
  //   id?: number | string;
  //   firstPhotoID?: number | string;
  //   representativePhoto?: { isRepresentativeButOtherTaxon?: boolean; id?: number | string };
  // };
  // From TaxonResult
  // {
  //   id: usableTaxon?.id,
  //   hideNavButtons,
  //   lastScreen,
  //   vision,
  //   firstPhotoID
  // }
  // From Taxonomy
  // {
  //   id: taxonId,
  //   hideNavButtons,
  //   usesVision: false,
  // }
  TaxonDetails: {
    // TODO: how can this be string?
    id?: number | string;
    // TODO: how can this be string?
    firstPhotoID?: number | string;
    representativePhoto?: {
      isRepresentativeButOtherTaxon?: boolean;
      id?: number | string;
    };
    hideNavButtons?: boolean;
    lastScreen?: "Suggestions";
    // TODO: do we really use both?
    vision?: boolean;
    usesVision?: boolean;
  };
  // From App.js
  // item is SharedItem
  PhotoSharing: {
    item: {
      mimeType: string;
      data: string | string[];
    };
  };
  // From usePrepareStoreAndNavigate.ts
  // {
  //   entryScreen: "CameraWithDevice";
  //   lastScreen: "CameraWithDevice";
  // }
  // From PhotoLibrary
  // {
  //   lastScreen: "PhotoLibrary";
  // }
  // From PhotoSharing
  // { lastScreen: "PhotoSharing" }
  // From GroupPhotosContainer
  // {
  //   entryScreen: "GroupPhotos",
  //   lastScreen: "GroupPhotos",
  // }
  Match: {
    entryScreen?: "CameraWithDevice" | "GroupPhotos";
    lastScreen: "CameraWithDevice" | "PhotoLibrary" | "PhotoSharing" | "GroupPhotos";
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
  // From PhotoSharing
  // { lastScreen: "PhotoSharing" }
  // From GroupPhotosContainer
  // {
  //   entryScreen: "GroupPhotos",
  //   lastScreen: "GroupPhotos",
  // }
  Suggestions: {
    entryScreen?: "CameraWithDevice" | "ObsEdit" | "ObsDetails" | "GroupPhotos";
    lastScreen?: "CameraWithDevice" |
      "ObsEdit" |
      "PhotoLibrary" |
      "ObsDetails" |
      "PhotoSharing" |
      "GroupPhotos";
    hideSkip?: boolean;
  };
  // From useObsDetailsSharedLogic.ts
  // { lastScreen: "ObsDetails" }
  SuggestionsTaxonSearch: {
    entryScreen?: "ObsEdit";
    lastScreen: "ObsEdit" | "ObsDetails";
  };
  MatchTaxonSearchScreen: undefined;
  AddToProjects: undefined;
  // From About
  //  {
  //   title: t( "COMMUNITY-GUIDELINES" ),
  //   initialUrl: url,
  //   loggedIn: false,
  // }
  FullPageWebView: {
    title: string;
    initialUrl: string;
    loggedIn: boolean;
  };
};

// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type OnboardingStackParamList = {
  Onboarding: undefined;
};

// Screens hosted by ExploreStackNavigator (ExploreV2)
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ExploreStackParamList = {
  ExploreResults: undefined;
  UniversalSearch: undefined;
  AdvancedSearch: undefined;
};

// Screens hosted by MyObservationsStackNavigator
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type MyObservationsStackParamList = {
  MyObservationsResults: undefined;
  SearchMyObservations: undefined;
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
  // TODO: type for other routes to Explore
  // From UserProfile
  // {
  //   user,
  //   worldwide: true,
  // }
  // From ProjectDetails
  // {
  //   project,
  //   worldwide: true,
  // }
  // {
  //   project,
  //   // If selected project has no place_id, show map in worldwide mode
  //   worldwide: !project?.place,
  //   place: project?.place,
  // }
  Explore: {
    user?: ApiUser;
    project?: object;
    place?: ApiPlace | null;
    worldwide: boolean;
  };
  ExploreFilters: undefined;
  ExploreSearch: undefined;
  // From NotificationsListItem
  // {
  //   uuid: notification.resource_uuid,
  //   targetActivityItemID: notification.identification_id || notification.comment_id,
  // }
  // From Map, ObservationsFlashList, navigateToObsDetails, MyObservationsSimple
  // { uuid }
  // From useNavigateWithTaxonSelected
  // {
  //   uuid: currentObservation?.uuid,
  //   identTaxonId: selectedTaxon?.id,
  //   identTaxonFromVision: vision,
  //   identAt: Date.now(),
  // }
  // From TaxonDetails
  // {
  //   uuid: obsUuid,
  //   identTaxonId: taxon?.id,
  //   identAt: Date.now(),
  // }
  ObsDetails: {
    uuid: string;
    targetActivityItemID?: number;
    identAt?: number;
    identTaxonId?: number;
    identTaxonFromVision?: boolean;
  };
  Notifications: undefined;
  // From ProjectRequirements, InlineUserBase, UserList
  // { userId: number }
  // From UserText
  // { login: string }
  UserProfile: {
    userId?: number;
    login?: string;
  };
  // From DQAButton
  // { observationUUID }
  DataQualityAssessment: { observationUUID: string };
  Projects: undefined;
  // From LoginForm
  // { id: params.projectId }
  ProjectDetails: { id: number };
  // From ProjectDetails
  // { id: project.id }
  ProjectRequirements: { id: number };
  // From ProjectDetails
  // {
  //   id: project.id,
  //   title: project.title,
  // }
  ProjectMembers: {
    id: number;
    title: string;
  };
  // From ProjectButton, ProjectSection
  // { observationUuid: observation.uuid }
  // From UserProfile
  // {
  //   userId,
  //   userLogin: user.login,
  // }
  ProjectList: {
    observationUuid?: string;
    userId?: number;
    userLogin?: string;
  };
  FollowersList: {
    userId: number;
    userLogin: string;
  };
  FollowingList: {
    userId: number;
    userLogin: string;
  };
  // From UserProfile
  // {
  //   userLogin: user?.login,
  //   journalPostsCount: user?.journal_posts_count,
  // }
  // From ProjectDetails
  // {
  //   projectIcon: project?.icon
  //   projectId: project?.id,
  //   projectTitle: project?.title,
  // }
  Journal: {
    userIcon?: string;
    userId?: number;
    userLogin?: string;
    projectIcon?: string;
    projectId?: number;
    projectTitle?: string;
    journalPostsCount?: number;
  } | undefined;
  Debug: undefined;
  UILibrary: undefined;
  UiLibraryItem: undefined;
  Log: undefined;
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
  SoundRecorder: undefined;
  // From PhotoSharing
  // { lastScreen: "PhotoSharing" }
  GroupPhotos: { lastScreen: "PhotoSharing" };
};

export type NoBottomTabStackParamList = BaseNoBottomTabStackParamList &
  SharedStackParamList;

// Note from the documentation:
// The type containing the mapping must be a type alias. It cannot be an interface.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type LoginStackParamList = {
  // From SignUpConfirmationForm
  // no params
  // From useLinking
  // { emailConfirmed: true }
  Login: {
    emailConfirmed?: boolean;
    prevScreen?: string;
    projectId?: number;
  } | undefined;
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

// ExploreStackNavigator is nested inside RootExplore. This composite type
// acknowledges ExploreV2 screens access to outer-stack routes
export type ExploreStackScreenProps<T extends keyof ExploreStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ExploreStackParamList, T>,
    TabStackScreenProps<"RootExplore">
  >;

// MyObservationsStackNavigator is nested inside ObsList. This composite type
// acknowledges MyObservations screens access to outer-stack routes
export type MyObservationsStackScreenProps<T extends keyof MyObservationsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<MyObservationsStackParamList, T>,
    TabStackScreenProps<"ObsList">
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
