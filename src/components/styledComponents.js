// @flow

import {
  BottomSheetTextInput as StyledBottomSheetTextInput
} from "@gorhom/bottom-sheet";
import { styled } from "nativewind";
import {
  Image as UnstyledImage,
  ImageBackground as UnstyledImageBackground,
  KeyboardAvoidingView as UnstyledKeyboardAvoidingView,
  Modal as UnstyledModal,
  Platform,
  Pressable as StyledPressable,
  SafeAreaView as UnstyledSafeAreaView,
  ScrollView as UnstyledScrollView,
  Text as UnstyledText,
  TextInput as UntyledTextInput,
  View as UnstyledView
} from "react-native";
// eslint-disable-next-line import/no-extraneous-dependencies
import UnstyledFastImage from "react-native-fast-image";
import UnstyledLinearGradient from "react-native-linear-gradient";

// $FlowIgnore
const View = styled( UnstyledView );
// $FlowIgnore
const KeyboardAvoidingView = styled( UnstyledKeyboardAvoidingView );
// $FlowIgnore
const SafeAreaView = styled( UnstyledSafeAreaView );
// $FlowIgnore
const ScrollView = styled( UnstyledScrollView );
// $FlowIgnore
const Text = styled(
  UnstyledText,
  Platform.OS === "ios"
    ? "font-Whitney-Medium"
    : "font-Whitney-Medium-Pro"
);
// $FlowIgnore
const LightText = styled(
  UnstyledText,
  Platform.OS === "ios"
    ? "font-Whitney-Light"
    : "font-Whitney-Light-Pro"
);
// $FlowIgnore
const TextInput = styled( UntyledTextInput );
// $FlowIgnore
const Pressable = styled( StyledPressable );
// $FlowIgnore
const Image = styled( UnstyledImage );
// $FlowIgnore
const BottomSheetTextInput = styled( StyledBottomSheetTextInput );
// $FlowIgnore
const Modal = styled( UnstyledModal );
// $FlowIgnore
const ImageBackground = styled( UnstyledImageBackground );

const fontMonoClass: string = ( Platform.OS === "ios"
  ? "font-Menlo"
  : "font-monospace" );

// $FlowIgnore
const LinearGradient = styled( UnstyledLinearGradient );

// $FlowIgnore
const FastImage = styled( UnstyledFastImage );

export {
  BottomSheetTextInput,
  FastImage,
  fontMonoClass,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  LightText,
  LinearGradient,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
};
