// Wrapper around things that should only be visible in debug mode
import { View } from "components/styledComponents";
import React, { PropsWithChildren } from "react";
import { useDebugMode } from "sharedHooks";

const Debug = ( { children }: PropsWithChildren ) => {
  const { isDebug } = useDebugMode( );
  if ( !isDebug ) return null;
  return (
    <View className="bg-deeppink">
      {children}
    </View>
  );
};

export default Debug;
