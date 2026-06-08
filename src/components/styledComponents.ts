import { FasterImageView as UnstyledFasterImageView } from "@candlefinance/faster-image";
import {
  BottomSheetTextInput as StyledBottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import UnstyledPressableWithTracking
  from "components/SharedComponents/Buttons/PressableWithTracking";
import { styled } from "nativewind";
import {
  Image as UnstyledImage,
  ImageBackground as UnstyledImageBackground,
  KeyboardAvoidingView as UnstyledKeyboardAvoidingView,
  Modal as UnstyledModal,
  Platform,
  ScrollView as UnstyledScrollView,
  Text as UnstyledText,
  TextInput as UntyledTextInput,
  View as UnstyledView,
} from "react-native";
import UnstyledLinearGradient from "react-native-linear-gradient";
import { SafeAreaView as UnstyledSafeAreaView } from "react-native-safe-area-context";

const View = styled( UnstyledView );
const KeyboardAvoidingView = styled( UnstyledKeyboardAvoidingView );
// Since upgrading to React Native 0.73 UnstyledSafeAreaView is undefined in the jest tests
// Why I don't know. This is just to fix the failing tests.
const SafeAreaView = styled( UnstyledSafeAreaView === undefined
  ? UnstyledView
  : UnstyledSafeAreaView );
const ScrollView = styled( UnstyledScrollView );
const Text = styled( UnstyledText );
const TextInput = styled( UntyledTextInput );
const Pressable = styled( UnstyledPressableWithTracking );
const Image = styled( UnstyledImage );
const BottomSheetTextInput = styled( StyledBottomSheetTextInput );
const Modal = styled( UnstyledModal );
const ImageBackground = styled( UnstyledImageBackground );

const fontMonoClass: string = ( Platform.OS === "ios"
  ? "font-Menlo"
  : "font-monospace" );

const LinearGradient = styled( UnstyledLinearGradient );

const FasterImageView = styled( UnstyledFasterImageView );

export {
  BottomSheetTextInput,
  FasterImageView,
  fontMonoClass,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  LinearGradient,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
};
