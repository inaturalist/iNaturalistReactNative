// Mostly from https://github.com/pmndrs/zustand/blob/main/docs/guides/testing.md#jest

import { cloneDeep } from "lodash";
import type * as zustand from "zustand";

const { create: actualCreate, createStore: actualCreateStore }
  = jest.requireActual<typeof zustand>( "zustand" );

// Reset functions for all stores declared in the app. These will get run in
// tests/jest.post-setup.js in an afterEach callback
export const storeResetFns = new Set<() => void>();

const createUncurried = <T>( stateCreator: zustand.StateCreator<T> ) => {
  const store = actualCreate( stateCreator );
  // cloneDeep may not be totally necessary, but it assuages some paranoia
  // about this object getting mutated
  const initialState = cloneDeep( store.getState() );
  storeResetFns.add( () => {
    store.setState( initialState, true );
  } );
  return store;
};

// when creating a store, we get its initial state, create a reset function and add it in the set
export const create = ( <T>( stateCreator: zustand.StateCreator<T> ) => (
  // to support curried version of create
  typeof stateCreator === "function"
    ? createUncurried( stateCreator )
    : createUncurried
) ) as typeof zustand.create;

const createStoreUncurried = <T>( stateCreator: zustand.StateCreator<T> ) => {
  const store = actualCreateStore( stateCreator );
  const initialState = cloneDeep( store.getState() );
  storeResetFns.add( () => {
    store.setState( initialState, true );
  } );
  return store;
};

// when creating a store, we get its initial state, create a reset function and add it in the set
export const createStore = ( <T>( stateCreator: zustand.StateCreator<T> ) => (
  // to support curried version of createStore
  typeof stateCreator === "function"
    ? createStoreUncurried( stateCreator )
    : createStoreUncurried
) ) as typeof zustand.createStore;
