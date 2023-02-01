// @flow
import { createRealmContext } from "@realm/react";
import { createContext } from "react";
import RNFS from "react-native-fs";
// eslint-disable-next-line import/extensions
import realmConfig from "realmModels/index";

import { log } from "../../react-native-logs.config";

const logger = log.extend( "contexts.js" );

async function checkOnRealmPath( context ) {
  const existResult = await RNFS.exists( realmConfig.path );
  logger.info( `${context} does ${realmConfig.path} exist? ${existResult}` );
}
checkOnRealmPath( "before creating realm context" );

const ObsEditContext: Object = createContext<Function>( );
const RealmContext: Object = createRealmContext( realmConfig );
checkOnRealmPath( "after creating realm context" );
setTimeout( ( ) => {
  checkOnRealmPath( "5s after creating realm context" );
}, 5000 );

export {
  ObsEditContext,
  RealmContext
};
