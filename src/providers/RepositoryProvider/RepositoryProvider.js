// @flow
import type { Node } from "react";
import React, { useMemo } from "react";

import { RealmContext } from "../contexts";
import RepositoryContext from "./RepositoryContext";

type Props = {
  children: any
}

const RepositoryProvider = ( { children }: Props ): Node => {
  const providerValue = useMemo( ( ) => ( {
    // TODO in theory this provider could completely isolate the RealmContext
    // from the rest of the app, and maybe provide singleton instances of
    // model-specific repositories it holds in state
  } ), [] );

  return (
    <RealmContext.Provider>
      <RepositoryContext.Provider value={providerValue}>
        {children}
      </RepositoryContext.Provider>
    </RealmContext.Provider>
  );
};

export default RepositoryProvider;
