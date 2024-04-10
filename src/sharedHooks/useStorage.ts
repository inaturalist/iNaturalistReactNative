import { useMMKVBoolean } from "react-native-mmkv";

const useStorage = ( ): {
  // TODO: Can I set a default value so that this is always a boolean?
  isAdvancedUser: boolean | undefined,
  setIsAdvancedUser: ( value: boolean ) => void
} => {
  const [isAdvancedUser, setIsAdvancedUser] = useMMKVBoolean( "isAdvancedUser" );
  return { isAdvancedUser, setIsAdvancedUser };
};

export default useStorage;
