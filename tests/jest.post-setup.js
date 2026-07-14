import { act } from "@testing-library/react-native";

import * as mockZustand from "../__mocks__/zustand";

// Prevent fake timers from leaking between test files sharing a worker.
afterAll( () => {
  jest.useRealTimers();
} );

// Reset the Zustand state after every test. See also ../__mocks__/zustand.ts
afterEach( () => {
  act( () => {
    mockZustand.storeResetFns.forEach( resetFn => {
      resetFn();
    } );
  } );
} );
