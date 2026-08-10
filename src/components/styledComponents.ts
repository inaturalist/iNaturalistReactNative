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
import UnstyledDraggableFlatList from "react-native-draggable-flatlist";
import UnstyledLinearGradient from "react-native-linear-gradient";
import {
  ActivityIndicator as UnstyledPaperActivityIndicator,
  TextInput as UnstyledPaperTextInput,
} from "react-native-paper";
import UnstyledCarousel from "react-native-reanimated-carousel";
import { SafeAreaView as UnstyledSafeAreaView } from "react-native-safe-area-context";
import UnstyledWebView from "react-native-webview";

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

const PaperTextInput = cssInterop( UnstyledPaperTextInput, { className: "style" } );

const PaperActivityIndicator = cssInterop(
  UnstyledPaperActivityIndicator,
  { className: "style" },
);

const WebView = cssInterop( UnstyledWebView, { className: "style" } );

const DraggableFlatList = cssInterop( UnstyledDraggableFlatList, { className: "style" } );

const Carousel = cssInterop( UnstyledCarousel, { className: "style" } );

export {
  BottomSheetTextInput,
  Carousel,
  DraggableFlatList,
  FasterImageView,
  fontMonoClass,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  LinearGradient,
  Modal,
  PaperActivityIndicator,
  PaperTextInput,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  WebView,
};
