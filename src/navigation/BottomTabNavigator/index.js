import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import About from "components/About";
import AddID from "components/AddID/AddID";
import CameraContainer from "components/Camera/CameraContainer";
import ExploreContainer from "components/Explore/ExploreContainer";
import Identify from "components/Identify/Identify";
import LocationPickerContainer from "components/LocationPicker/LocationPickerContainer";
import ForgotPassword from "components/LoginSignUp/ForgotPassword";
import LicensePhotos from "components/LoginSignUp/LicensePhotos";
import Login from "components/LoginSignUp/Login";
import SignUp from "components/LoginSignUp/SignUp";
import SignUpConfirmation from "components/LoginSignUp/SignUpConfirmation";
import MediaViewer from "components/MediaViewer/MediaViewer";
import Messages from "components/Messages/Messages";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import NetworkLogging from "components/NetworkLogging";
import DataQualityAssessment from "components/ObsDetails/DataQualityAssessment";
import ObsDetails from "components/ObsDetails/ObsDetails";
import ObsEdit from "components/ObsEdit/ObsEdit";
import GroupPhotosContainer from "components/PhotoImporter/GroupPhotosContainer";
import PhotoGallery from "components/PhotoImporter/PhotoGallery";
import PlaceholderComponent from "components/PlaceholderComponent";
import ProjectDetails from "components/Projects/ProjectDetails";
import Projects from "components/Projects/Projects";
import Search from "components/Search/Search";
import Settings from "components/Settings/Settings";
import Mortal from "components/SharedComponents/Mortal";
import PermissionGate, {
  AUDIO_PERMISSIONS,
  CAMERA_PERMISSIONS,
  LOCATION_PERMISSIONS,
  READ_MEDIA_PERMISSIONS
} from "components/SharedComponents/PermissionGateContainer";
import SoundRecorder from "components/SoundRecorder/SoundRecorder";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import UiLibrary from "components/UiLibrary";
import UserProfile from "components/UserProfile/UserProfile";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  hideHeaderLeft,
  showCustomHeader,
  showHeaderLeft,
  showLongHeader
} from "navigation/navigationOptions";
import React from "react";
import User from "realmModels/User";
import useUserMe from "sharedHooks/useUserMe";
import colors from "styles/tailwindColors";

import CustomTabBar from "./CustomTabBar";

const Tab = createBottomTabNavigator();

const OBS_LIST_SCREEN_ID = "ObsList";
const EXPLORE_SCREEN_ID = "Explore";
const MESSAGES_SCREEN_ID = "Messages";

/* eslint-disable react/jsx-props-no-spreading */

// The login component should be not preserve its state or effects after the
// user navigates away from it. This will simply cause it to unmount when it
// loses focus
const MortalLogin = ( ) => (
  <Mortal>
    <Login />
  </Mortal>
);

const CameraContainerWithPermission = ( ) => (
  <PermissionGate
    permissions={CAMERA_PERMISSIONS}
    title={t( "Observe-and-identify-organisms-in-real-time-with-your-camera" )}
    titleDenied={t( "Please allow Camera Access" )}
    body={t( "Use-the-iNaturalist-camera-to-observe" )}
    blockedPrompt={t( "Youve-previously-denied-camera-permissions" )}
    icon="camera"
  >
    <CameraContainer />
  </PermissionGate>
);

const SoundRecorderWithPermission = ( ) => (
  <PermissionGate
    permissions={AUDIO_PERMISSIONS}
    title={t( "Record-organism-sounds-with-the-microphone" )}
    titleDenied={t( "Please-allow-Microphone-Access" )}
    body={t( "Use-your-devices-microphone-to-record" )}
    blockedPrompt={t( "Youve-previously-denied-microphone-permissions" )}
    icon="microphone"
    image={require( "images/viviana-rishe-j2330n6bg3I-unsplash.jpg" )}
  >
    <SoundRecorder />
  </PermissionGate>
);

const PhotoGalleryWithPermission = ( ) => (
  <PermissionGate
    permissions={READ_MEDIA_PERMISSIONS}
    title={t( "Observe-and-identify-organisms-from-your-gallery" )}
    titleDenied={t( "Please-Allow-Gallery-Access" )}
    body={t( "Upload-photos-from-your-gallery-and-create-observations" )}
    blockedPrompt={t( "Youve-previously-denied-gallery-permissions" )}
    icon="gallery"
    image={require( "images/azmaan-baluch-_ra6NcejHVs-unsplash.jpg" )}
  >
    <PhotoGallery />
  </PermissionGate>
);

const ObsEditWithPermission = ( ) => (
  <Mortal>
    <PermissionGate
      permissions={LOCATION_PERMISSIONS}
      title={t( "Get-more-accurate-suggestions-create-useful-data" )}
      titleDenied={t( "Please-allow-Location-Access" )}
      body={t( "iNaturalist-uses-your-location-to-give-you" )}
      blockedPrompt={t( "Youve-previously-denied-location-permissions" )}
      icon="map-marker-outline"
      image={require( "images/landon-parenteau-EEuDMqRYbx0-unsplash.jpg" )}
    >
      <ObsEdit />
    </PermissionGate>
  </Mortal>
);

const BottomTabs = ( ) => {
  const { remoteUser: user } = useUserMe( );

  const renderTabBar = props => <CustomTabBar {...props} />;

  return (
    <Mortal>
      <Tab.Navigator
        initialRouteName={OBS_LIST_SCREEN_ID}
        tabBar={renderTabBar}
        backBehavior="history"
        screenOptions={showHeaderLeft}
      >
        <Tab.Screen
          name="Explore"
          component={ExploreContainer}
          options={{
            ...hideHeader,
            meta: {
              icon: "compass-rose-outline",
              testID: EXPLORE_SCREEN_ID,
              accessibilityLabel: t( "Explore" ),
              accessibilityHint: t( "Navigates-to-explore" ),
              size: 40
            }
          }}
        />
        <Tab.Screen
          name="ObsList"
          component={MyObservationsContainer}
          options={{
            ...hideHeader,
            meta: {
              icon: "person",
              userIconUri: User.uri( user ),
              testID: OBS_LIST_SCREEN_ID,
              accessibilityLabel: t( "Observations" ),
              accessibilityHint: t( "Navigates-to-observations" ),
              size: 40
            }
          }}
        />
        <Tab.Screen
          name="Messages"
          component={Messages}
          options={{
            ...hideHeaderLeft,
            meta: {
              icon: "notifications-bell",
              testID: MESSAGES_SCREEN_ID,
              accessibilityLabel: t( "Messages" ),
              accessibilityHint: t( "Navigates-to-messages" ),
              size: 32
            }
          }}
        />
        <Tab.Screen
          name="search"
          component={Search}
          options={{
            ...hideHeaderLeft,
            headerTitle: t( "Search" )
          }}
        />
        <Tab.Screen
          name="Identify"
          component={Identify}
          options={{ headerTitle: t( "Identify" ) }}
        />
        <Tab.Screen
          name="Projects"
          component={Projects}
          options={{ headerTitle: t( "Projects" ) }}
        />
        <Tab.Screen
          name="ProjectDetails"
          component={ProjectDetails}
          options={{ headerTitle: t( "Project" ) }}
        />
        <Tab.Screen
          name="settings"
          component={Settings}
          options={{ ...hideHeaderLeft, headerTitle: t( "Settings" ) }}
        />
        <Tab.Screen
          name="about"
          component={About}
          options={{ ...hideHeaderLeft, headerTitle: t( "About-iNaturalist" ) }}
        />
        <Tab.Screen
          name="help"
          component={PlaceholderComponent}
          options={hideHeaderLeft}
        />
        <Tab.Screen
          name="network"
          component={NetworkLogging}
          options={hideHeaderLeft}
        />
        <Tab.Screen
          name="UI Library"
          component={UiLibrary}
          options={{
            ...hideHeaderLeft
          }}
        />
        <Tab.Screen
          name="ObsDetails"
          component={ObsDetails}
          options={{
            headerTitle: t( "Observation" ),
            headerShown: false,
            unmountOnBlur: true
          }}
        />
        <Tab.Screen
          name="TaxonDetails"
          component={TaxonDetails}
          options={hideHeader}
        />
        <Tab.Screen
          name="UserProfile"
          component={UserProfile}
          options={blankHeaderTitle}
        />
        <Tab.Screen
          name="PhotoGallery"
          component={PhotoGalleryWithPermission}
          options={blankHeaderTitle}
        />
        <Tab.Screen
          name="GroupPhotos"
          component={GroupPhotosContainer}
          options={{
            ...showHeaderLeft,
            ...showCustomHeader,
            lazy: true,
            title: t( "Group-Photos" )
          }}
        />
        <Tab.Screen
          name="Camera"
          component={CameraContainerWithPermission}
          options={{ ...hideHeader, orientation: "all", unmountOnBlur: true }}
        />
        <Tab.Screen
          name="SoundRecorder"
          component={SoundRecorderWithPermission}
          options={{
            title: t( "Record-new-sound" )
          }}
        />
        <Tab.Screen
          name="ObsEdit"
          component={ObsEditWithPermission}
          options={{
            ...blankHeaderTitle,
            headerBackVisible: false
          }}
        />
        <Tab.Screen
          name="AddID"
          component={AddID}
          options={{
            title: t( "Add-an-ID" )
          }}
        />
        <Tab.Screen
          name="LocationPicker"
          component={LocationPickerContainer}
          options={hideHeader}
        />
        <Tab.Screen
          name="MediaViewer"
          component={MediaViewer}
          options={{
            ...blankHeaderTitle,
            headerStyle: {
              backgroundColor: colors.black
            },
            ...hideHeaderLeft
          }}
        />
        <Tab.Screen
          name="DataQualityAssessment"
          component={DataQualityAssessment}
          options={{
            ...showLongHeader,
            headerTitle: t( "DATA-QUALITY-ASSESSMENT" ),
            unmountOnBlur: true
          }}
        />
        <Tab.Screen name="Login" component={MortalLogin} options={hideHeader} />
        <Tab.Screen name="SignUp" component={SignUp} options={hideHeader} />
        <Tab.Screen name="ForgotPassword" component={ForgotPassword} options={hideHeader} />
        <Tab.Screen name="LicensePhotos" component={LicensePhotos} options={hideHeader} />
        <Tab.Screen name="SignUpConfirmation" component={SignUpConfirmation} options={hideHeader} />

        <Tab.Screen
          name="Help"
          component={PlaceholderComponent}
        />
        <Tab.Screen
          name="Blog"
          component={PlaceholderComponent}
        />
        <Tab.Screen
          name="Donate"
          component={PlaceholderComponent}
        />
      </Tab.Navigator>
    </Mortal>
  );
};

export default BottomTabs;
