// @flow

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
import {
  blankHeaderTitle,
  hideHeader,
  hideScreenTransitionAnimation,
  showHeader
} from "navigation/navigationOptions";
import ExploreProvider from "providers/ExploreProvider";
import * as React from "react";
import { PermissionsAndroid } from "react-native";
import { PERMISSIONS } from "react-native-permissions";

const Stack = createNativeStackNavigator( );

const PhotoGalleryWithPermission = ( ) => (
  <PermissionGate permission={PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE}>
    <PermissionGate permission={PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE}>
      <PermissionGate permission={PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION}>
        <PermissionGate permission={PERMISSIONS.IOS.PHOTO_LIBRARY} isIOS>
          <PermissionGate permission={PERMISSIONS.IOS.LOCATION_WHEN_IN_USE} isIOS>
            <PhotoGallery />
          </PermissionGate>
        </PermissionGate>
      </PermissionGate>
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
          name="StandardCamera"
          component={StandardCameraWithPermission}
          options={hideHeader}
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
          name="SoundRecorder"
          component={SoundRecorderWithPermission}
          options={{
            title: t( "Record-new-sound" )
          }}
        />
        <Stack.Screen
          name="ObsEdit"
          component={ObsEditWithPermission}
          options={blankHeaderTitle}
        />
        <Stack.Screen
          name="AddID"
          component={AddID}
          options={{
            title: t( "Add-an-ID" )
          }}
        />
        <Stack.Screen
          name="ObsDetails"
          component={ObsDetails}
          options={{
            headerTitle: t( "Observation" )
          }}
        />
        <Stack.Screen
          name="TaxonDetails"
          component={TaxonDetails}
          options={blankHeaderTitle}
        />
        <Stack.Screen
          name="UserProfile"
          component={UserProfile}
          options={blankHeaderTitle}
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
            ...showHeader,
            ...hideScreenTransitionAnimation,
            headerTitle: t( "Explore" )
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
