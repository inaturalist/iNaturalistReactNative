import { createRealmContext } from "@realm/react";
// eslint-disable-next-line import/extensions
import realmConfig from "realmModels/index";

// This is just some debug code that might be useful for investigating
// problems with messing realm files
// import RNFS from "react-native-fs";
// async function checkOnRealmPath( context ) {
//   const existResult = await RNFS.exists( realmConfig.path );
// }
// checkOnRealmPath( "before creating realm context" );

// TODO: How to use Realm with TS
const RealmContext = createRealmContext( realmConfig );

export {
  // eslint-disable-next-line import/prefer-default-export
  RealmContext,
};
