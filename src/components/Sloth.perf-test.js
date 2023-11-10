import React from "react";
import { measurePerformance } from "reassure";

import Sloth from "./Sloth";

test( "Sloth performoance", async ( ) => {
  await measurePerformance( <Sloth /> );
} );
