// @flow
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StandardCamera from "components/Camera/StandardCamera";
import Login from "components/LoginSignUp/Login";
import AddID from "components/ObsEdit/AddID";
import ObsEdit from "components/ObsEdit/ObsEdit";
import Mortal from "components/SharedComponents/Mortal";
import PermissionGate from "components/SharedComponents/PermissionGate";
import SoundRecorder from "components/SoundRecorder/SoundRecorder";
import UserProfile from "components/UserProfile/UserProfile";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  hideScreenTransitionAnimation,
  showHeader
} from "navigation/navigationOptions";
import * as React from "react";
import { PermissionsAndroid } from "react-native";
import DeviceInfo from "react-native-device-info";

import BottomTabNavigator from "./BottomTabNavigator";

const isTablet = DeviceInfo.isTablet();

const Stack = createNativeStackNavigator();

const StandardCameraWithPermission = () => (
  <PermissionGate
    permission={PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE}
  >
    <PermissionGate permission={PermissionsAndroid.PERMISSIONS.CAMERA}>
      <StandardCamera />
    </PermissionGate>
  </PermissionGate>
);

const SoundRecorderWithPermission = () => (
  <PermissionGate permission={PermissionsAndroid.PERMISSIONS.RECORD_AUDIO}>
    <PermissionGate
      permission={PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE}
    >
      <PermissionGate
        permission={PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE}
      >
        <SoundRecorder />
      </PermissionGate>
    </PermissionGate>
  </PermissionGate>
);

// The login component should be not preserve its state or effects after the
// user navigates away from it. This will simply cause it to unmount when it
// loses focus
const MortalLogin = () => (
  <Mortal>
    <Login />
  </Mortal>
);

const ObsEditWithPermission = () => (
  <Mortal>
    <PermissionGate
      permission={PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION}
    >
      <ObsEdit />
    </PermissionGate>
  </Mortal>
);

const MainStackNavigation = (): React.Node => (
  <Mortal>
    <Stack.Navigator screenOptions={showHeader}>
      <Stack.Screen
        name="Home"
        component={BottomTabNavigator}
        options={{
          ...hideHeader,
          ...hideScreenTransitionAnimation
        }}
      />
      <Stack.Screen
        name="StandardCamera"
        component={StandardCameraWithPermission}
        options={{ ...hideHeader, orientation: isTablet ? "all" : "portrait" }}
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
        options={{
          ...blankHeaderTitle,
          headerBackVisible: false
        }}
      />
      <Stack.Screen
        name="AddID"
        component={AddID}
        options={{
          title: t( "Add-an-ID" )
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={blankHeaderTitle}
      />
      <Stack.Screen name="login" component={MortalLogin} options={hideHeader} />
    </Stack.Navigator>
  </Mortal>
);

export default MainStackNavigation;
