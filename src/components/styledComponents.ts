import { FasterImageView as UnstyledFasterImageView } from "@candlefinance/faster-image";
import {
  BottomSheetTextInput as StyledBottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import UnstyledPressableWithTracking
  from "components/SharedComponents/Buttons/PressableWithTracking";
import { cssInterop } from "nativewind";
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

// Core react-native components are registered with nativewind automatically;
// third-party components need explicit cssInterop registration for className
// to have any effect
const View = UnstyledView;
const KeyboardAvoidingView = UnstyledKeyboardAvoidingView;
// Since upgrading to React Native 0.73 UnstyledSafeAreaView is undefined in the jest tests
// Why I don't know. This is just to fix the failing tests.
const SafeAreaView = UnstyledSafeAreaView === undefined
  ? UnstyledView
  : cssInterop( UnstyledSafeAreaView, { className: "style" } );
const ScrollView = UnstyledScrollView;
const Text = UnstyledText;
const TextInput = UntyledTextInput;
const Pressable = UnstyledPressableWithTracking;
const Image = UnstyledImage;
const BottomSheetTextInput = cssInterop( StyledBottomSheetTextInput, { className: "style" } );
const Modal = UnstyledModal;
const ImageBackground = UnstyledImageBackground;

const fontMonoClass: string = ( Platform.OS === "ios"
  ? "font-Menlo"
  : "font-monospace" );

const LinearGradient = cssInterop( UnstyledLinearGradient, { className: "style" } );

const FasterImageView = cssInterop( UnstyledFasterImageView, { className: "style" } );

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
