// @flow
import { createRealmContext } from "@realm/react";
import { createContext } from "react";

import realmConfig from "../models/index";

const ExploreContext: Object = createContext<Function>( );
const ObsEditContext: Object = createContext<Function>( );
const RealmContext: Object = createRealmContext( realmConfig );

export {
  ExploreContext,
  ObsEditContext,
  RealmContext
};
