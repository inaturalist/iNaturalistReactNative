import useStore from "stores/useStore";
import factory from "tests/factory";

export const initialStoreState = useStore.getState( );

// export const makeObsField = ( overrides = {} ) => ( {
//   allowedValues: [],
//   datatype: "text",
//   description: null,
//   id: 100,
//   name: "Test Field",
//   ...overrides,
// } );

// export const makePof = ( overrides = {} ) => ( {
//   id: 1,
//   obsField: makeObsField( overrides.obsField ),
//   position: 0,
//   required: false,
//   ...overrides,
// } );

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
