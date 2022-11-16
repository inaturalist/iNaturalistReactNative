// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StandardCamera from "components/Camera/StandardCamera";
import Explore from "components/Explore/Explore";
import ExploreFilters from "components/Explore/ExploreFilters";
import ExploreLanding from "components/Explore/ExploreLanding";
import Messages from "components/Messages/Messages";
import ObsDetails from "components/ObsDetails/ObsDetails";
import AddID from "components/ObsEdit/AddID";
import ObsEdit from "components/ObsEdit/ObsEdit";
import ObsList from "components/Observations/ObsList";
import GroupPhotos from "components/PhotoImporter/GroupPhotos";
import PhotoAlbumPicker from "components/PhotoImporter/PhotoAlbumPicker";
import PhotoGallery from "components/PhotoImporter/PhotoGallery";
import Mortal from "components/SharedComponents/Mortal";
import PermissionGate from "components/SharedComponents/PermissionGate";
import SoundRecorder from "components/SoundRecorder/SoundRecorder";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import UserProfile from "components/UserProfile/UserProfile";
import { t } from "i18next";
import ExploreProvider from "providers/ExploreProvider";
import * as React from "react";
import { PermissionsAndroid, Platform } from "react-native";
import colors from "styles/tailwindColors";

const Stack = createNativeStackNavigator( );

const hideHeader = {
  headerShown: false
};

const showHeader = {
  headerShown: true,
  headerBackTitleVisible: false,
  headerShadowVisible: false,
  headerTintColor: colors.black,
  // Note: left header is not supported on iOS
  // so we would need to build a custom header for this:
  // https://reactnavigation.org/docs/native-stack-navigator#headertitlealign
  headerTitleStyle: {
    fontSize: 20,
    fontFamily: Platform.OS === "ios" ? "Whitney-Medium" : "Whitney-Medium-Pro"
  }
};

const hideScreenTransitionAnimation = {
  animation: "none"
};

const showBackButton = ( { navigation } ) => ( {
  headerLeft: ( ) => <HeaderBackButton onPress={( ) => navigation.goBack( )} />
} );

const PhotoGalleryWithPermission = ( ) => (
  <PermissionGate permission={PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE}>
    <PermissionGate permission={PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE}>
      <PhotoGallery />
    </PermissionGate>
  </PermissionGate>
);

const StandardCameraWithPermission = ( ) => (
  <PermissionGate permission={PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE}>
    <PermissionGate permission={PermissionsAndroid.PERMISSIONS.CAMERA}>
      <StandardCamera />
    </PermissionGate>
  </PermissionGate>
);

const SoundRecorderWithPermission = ( ) => (
  <PermissionGate permission={PermissionsAndroid.PERMISSIONS.RECORD_AUDIO}>
    <PermissionGate permission={PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE}>
      <PermissionGate permission={PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE}>
        <SoundRecorder />
      </PermissionGate>
    </PermissionGate>
  </PermissionGate>
);

const ObsEditWithPermission = () => (
  <Mortal>
    <PermissionGate permission={PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION}>
      <ObsEdit />
    </PermissionGate>
  </Mortal>
);

const photoGalleryHeaderTitle = ( ) => <PhotoAlbumPicker />;

const MainStackNavigation = ( ): React.Node => (
  <Mortal>
    <ExploreProvider>
      <Stack.Navigator screenOptions={showHeader}>
        <Stack.Screen
          name="ObsList"
          component={ObsList}
          options={{
            ...hideScreenTransitionAnimation,
            ...hideHeader
          }}
        />
        <Stack.Screen
          name="ObsDetails"
          component={ObsDetails}
        />
        <Stack.Screen
          name="UserProfile"
          component={UserProfile}
        />
        <Stack.Screen
          name="TaxonDetails"
          component={TaxonDetails}
          options={showBackButton}
        />
        <Stack.Screen
          name="PhotoGallery"
          component={PhotoGalleryWithPermission}
          options={{
            headerTitle: photoGalleryHeaderTitle
          }}
        />
        <Stack.Screen
          name="GroupPhotos"
          component={GroupPhotos}
          options={{
            title: t( "Group-Photos" )
          }}
        />
        <Stack.Screen
          name="ObsEdit"
          component={ObsEditWithPermission}
        />
        <Stack.Screen
          name="SoundRecorder"
          component={SoundRecorderWithPermission}
        />
        <Stack.Screen
          name="StandardCamera"
          component={StandardCameraWithPermission}
        />
        <Stack.Screen
          name="AddID"
          component={AddID}
          options={{
            title: t( "Add-an-ID" )
          }}
        />
        <Stack.Screen
          name="Messages"
          component={Messages}
          options={{
            ...showHeader,
            ...hideScreenTransitionAnimation
          }}
        />
        <Stack.Screen
          name="ExploreLanding"
          component={ExploreLanding}
          options={{
            ...hideHeader,
            ...hideScreenTransitionAnimation
          }}
        />
        <Stack.Screen
          name="Explore"
          component={Explore}
          options={{
            ...hideHeader,
            ...hideScreenTransitionAnimation
          }}
        />
        <Stack.Screen
          name="ExploreFilters"
          component={ExploreFilters}
          options={{
            ...hideHeader,
            ...hideScreenTransitionAnimation
          }}
        />
      </Stack.Navigator>
    </ExploreProvider>
  </Mortal>
);

export default MainStackNavigation;
