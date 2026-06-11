import { InteractionManager } from "react-native";
export function mockInteractionManagerRunAfterInteractions() {
  jest.spyOn( InteractionManager, "runAfterInteractions" ).mockImplementation( callback => {
    callback();
    return { cancel: jest.fn() };
  } );
}
