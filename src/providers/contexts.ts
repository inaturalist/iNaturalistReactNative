import { createRealmContext } from "@realm/react";
import realmConfig from "realmModels/index";

// This is just some debug code that might be useful for investigating
// problems with messing realm files
// import { exists } from "@dr.pogodin/react-native-fs";
// async function checkOnRealmPath( context ) {
//   const existResult = await exists( realmConfig.path );
// }
// checkOnRealmPath( "before creating realm context" );

// TODO: How to use Realm with TS
const RealmContext = createRealmContext( realmConfig );

export {
  RealmContext,
};
