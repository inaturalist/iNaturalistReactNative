// @flow

import {
  BottomSheetTextInput as StyledBottomSheetTextInput
} from "@gorhom/bottom-sheet";
import { styled } from "nativewind";
import {
  ActivityIndicator as StyledActivityIndicator,
  Image as StyledImage,
  ImageBackground as StyledImageBackground,
  KeyboardAvoidingView as StyledKeyboardAvoidingView,
  Modal as StyledModal,
  Platform,
  Pressable as StyledPressable,
  SafeAreaView as StyledSafeAreaView,
  ScrollView as StyledScrollView,
  Text as StyledText,
  TextInput as StyledTextInput,
  View as StyledView
} from "react-native";

// $FlowIgnore
const ActivityIndicator = styled( StyledActivityIndicator );
// $FlowIgnore
const View = styled( StyledView );
// $FlowIgnore
const KeyboardAvoidingView = styled( StyledKeyboardAvoidingView );
// $FlowIgnore
const SafeAreaView = styled( StyledSafeAreaView );
// $FlowIgnore
const ScrollView = styled( StyledScrollView );
// $FlowIgnore
const Text = styled(
  StyledText,
  Platform.OS === "ios"
    ? "font-Whitney-Medium"
    : "font-Whitney-Medium-Pro"
);
// $FlowIgnore
const LightText = styled(
  StyledText,
  Platform.OS === "ios"
    ? "font-Whitney-Light"
    : "font-Whitney-Light-Pro"
);
// $FlowIgnore
const TextInput = styled( StyledTextInput );
// $FlowIgnore
const Pressable = styled( StyledPressable );
// $FlowIgnore
const Image = styled( StyledImage );
// $FlowIgnore
const BottomSheetTextInput = styled( StyledBottomSheetTextInput );
// $FlowIgnore
const Modal = styled( StyledModal );
// $FlowIgnore
const ImageBackground = styled( StyledImageBackground );

const fontMonoClass: string = ( Platform.OS === "ios"
  ? "font-Menlo"
  : "font-monospace" );

export {
  ActivityIndicator,
  BottomSheetTextInput,
  fontMonoClass,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  LightText,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
};
