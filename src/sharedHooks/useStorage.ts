import { useMMKVBoolean } from "react-native-mmkv";

const useStorage = ( ): {
  isAdvancedUser: boolean,
  setIsAdvancedUser: ( value: boolean ) => void
} => {
  const [isAdvancedUser, setIsAdvancedUser] = useMMKVBoolean( "isAdvancedUser" );
  return { isAdvancedUser, setIsAdvancedUser };
};

export default useStorage;
