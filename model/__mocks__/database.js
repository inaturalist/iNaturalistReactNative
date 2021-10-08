import { Database } from "@nozbe/watermelondb";
import LokiJSAdapter from "@nozbe/watermelondb/adapters/lokijs";

import schema from "../schema";
import Observations from "../Observations";

const adapter = new LokiJSAdapter( {
  schema,
  useWebWorker: false,
  useIncrementalIndexedDB: true
} );

export default new Database( {
  adapter,
  modelClasses: [
    Observations
  ]
} );
