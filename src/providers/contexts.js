// @flow
import { createRealmContext } from "@realm/react";
import { createContext } from "react";
// eslint-disable-next-line import/extensions
import realmConfig from "realmModels/index";

const ExploreContext: Object = createContext<Function>( );
const ObsEditContext: Object = createContext<Function>( );
const RealmContext: Object = createRealmContext( realmConfig );

export {
  ExploreContext,
  ObsEditContext,
  RealmContext
};
