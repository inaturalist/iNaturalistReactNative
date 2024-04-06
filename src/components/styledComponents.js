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
// Since upgrading to React Native 0.73 UnstyledSafeAreaView is undefined in the jest tests
// Why I don't know. This is just to fix the failing tests.
// $FlowIgnore
const SafeAreaView = styled( UnstyledSafeAreaView === undefined
  ? UnstyledView
  : UnstyledSafeAreaView );
// $FlowIgnore
const ScrollView = styled( UnstyledScrollView );
// $FlowIgnore
const Text = styled(
  UnstyledText,
  Platform.OS === "ios"
    ? "font-Whitney-Book"
    : "font-Whitney-Book-Pro"
);
// $FlowIgnore
const MediumText = styled(
  UnstyledText,
  Platform.OS === "ios"
    ? "font-Whitney-Medium"
    : "font-Whitney-Medium-Pro"
);
// $FlowIgnore
const LightText = styled(
  UnstyledText,
  Platform.OS === "ios"
    ? "font-Whitney-Book"
    : "font-Whitney-Book-Pro"
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
  MediumText,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
};
