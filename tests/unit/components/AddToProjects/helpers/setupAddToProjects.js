import useStore from "stores/useStore";
import factory from "tests/factory";

export const initialStoreState = useStore.getState( );

export const mockProjects = [
  factory( "LocalProject" ),
  factory( "LocalProject" ),
];

export const resetStore = ( ) => {
  useStore.setState( initialStoreState, true );
  useStore.setState( {
    currentObservation: {
      ...factory( "LocalObservation" ),
      observationFieldValues: [],
      projectObservations: [factory( "LocalProjectObservation", {
        projectId: mockProjects[0].id,
      } )],
    },
  } );
};
