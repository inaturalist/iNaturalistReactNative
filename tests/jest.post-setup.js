import "@testing-library/jest-native/extend-expect";

import { act } from "@testing-library/react-native";
import * as mockZustand from "tests/mocks/zustand.ts";

// Reset the Zustand state after every test. See also tests/mocks/zustand.ts
afterEach( () => {
  act( () => {
    mockZustand.storeResetFns.forEach( resetFn => {
      resetFn();
    } );
  } );
} );
