// @flow
// $FlowIgnore[cannot-resolve-module]
import { createRealmContext } from "@realm/react";
// eslint-disable-next-line import/extensions
import realmConfig from "realmModels/index";

// This is just some debug code that might be useful for investigating
// problems with messing realm files
// import RNFS from "react-native-fs";
// import { log } from "../../react-native-logs.config";
// const logger = log.extend( "contexts.js" );
// async function checkOnRealmPath( context ) {
//   const existResult = await RNFS.exists( realmConfig.path );
//   logger.info( `${context} does ${realmConfig.path} exist? ${existResult}` );
// }
// checkOnRealmPath( "before creating realm context" );

const RealmContext: object = createRealmContext( realmConfig );

export {
  // eslint-disable-next-line
  RealmContext
};
