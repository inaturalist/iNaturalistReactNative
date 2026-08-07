import { screen, userEvent, within } from "@testing-library/react-native";
import AddToProjects from "components/AddToProjects/AddToProjects";
import glyphmap from "components/SharedComponents/INatIcon/glyphmap.json";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const actor = userEvent.setup( );

const iconGlyph = name => String.fromCharCode( glyphmap[name] );

const initialStoreState = useStore.getState( );

const mockProjects = [
  factory( "LocalProject" ),
  factory( "LocalProject" ),
];

const mockGoBack = jest.fn( );
jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( { goBack: mockGoBack } ),
  };
} );

jest.mock( "providers/contexts", () => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: () => global.realm,
      useQuery: ( ) => mockProjects,
    },
  };
} );

function renderAddToProjects( ) {
  return renderComponent(
    <AddToProjects />,
  );
}

beforeAll( async () => {
  useStore.setState( initialStoreState, true );
} );

beforeEach( ( ) => {
  jest.clearAllMocks( );
  useStore.setState( {
    currentObservation: {
      ...factory( "LocalObservation" ),
      observationFieldValues: [],
      projectObservations: [factory( "LocalProjectObservation", {
        projectId: mockProjects[0].id,
        _synced_at: new Date( ),
      } )],
    },
  } );
} );

describe( "AddToProjects", ( ) => {
  it( "renders section headers and collection/umbrella explainer", ( ) => {
    renderAddToProjects( );
    expect( screen.getByText( "Traditional Projects" ) ).toBeVisible( );
    expect( screen.getByText(
      "You can manually add observations to Traditional Projects you have joined.",
    ) ).toBeVisible( );
    expect( screen.getByText( "Collection & Umbrella Projects" ) ).toBeVisible( );
    expect( screen.getByText(
      // eslint-disable-next-line max-len
      "For most other projects, observations that meet project requirements will automatically be included in projects.",
    ) ).toBeVisible( );
  } );

  it( "renders joined projects", ( ) => {
    renderAddToProjects( );

    expect( screen.getByText( mockProjects[0].title ) ).toBeVisible( );
    expect( screen.getByText( mockProjects[1].title ) ).toBeVisible( );
    expect( screen.getAllByText( "Traditional Project" ).length ).toBe( 2 );
  } );

  it( "renders selected projects with expanded chooser", async ( ) => {
    renderAddToProjects( );

    const projectTitle = screen.getByText( mockProjects[1].title );
    await actor.press( projectTitle );

    expect(
      within( screen.getByTestId( `AddToProjects.project.${mockProjects[1].id}` ) )
        .getByText( iconGlyph( "checkmark-circle" ) ),
    ).toBeVisible( );

    expect(
      screen.getByText( mockProjects[1].projectObservationFields[0].obsField.name ),
    ).toBeVisible();
  } );

  it( "renders existing project observations as checked", ( ) => {
    renderAddToProjects( );

    expect(
      screen.getByTestId( `AddToProjects.project.${mockProjects[0].id}` ).props.accessibilityState
        ?.checked,
    ).toBe( true );
    expect(
      screen.getByTestId( `AddToProjects.project.${mockProjects[1].id}` ).props.accessibilityState
        ?.checked,
    ).toBe( false );
  } );

  it( "disables SAVE when project selection is unchanged", ( ) => {
    renderAddToProjects( );

    expect( screen.getByText( "SAVE" ) ).toBeDisabled();
  } );

  it( "enables SAVE after project selection changes", async ( ) => {
    renderAddToProjects( );

    await actor.press( screen.getByText( mockProjects[0].title ) );

    expect( screen.getByText( "SAVE" ) ).not.toBeDisabled( );
  } );

  it( "persists project selection to Zustand and navigates back on SAVE", async ( ) => {
    renderAddToProjects( );

    // select 1
    await actor.press( screen.getByText( mockProjects[1].title ) );
    await actor.press( screen.getByText( "SAVE" ) );

    expect(
      useStore.getState( ).currentObservation?.projectObservations?.map( po => po.projectId ),
    ).toEqual( [
      mockProjects[0].id,
      mockProjects[1].id,
    ] );
    expect( useStore.getState( ).unsavedChanges ).toBe( true );
    expect( mockGoBack ).toHaveBeenCalled( );
  } );

  it( "soft-deletes synced project observations when deselected", async ( ) => {
    renderAddToProjects();

    // deselect 0
    await actor.press( screen.getByText( mockProjects[0].title ) );
    await actor.press( screen.getByText( "SAVE" ) );

    expect( useStore.getState().currentObservation?.projectObservations ).toEqual(
      [expect.objectContaining( {
        projectId: mockProjects[0].id,
        _pendingRemoval: true,
      } )],
    );
    expect( mockGoBack ).toHaveBeenCalled();
  } );

  it( "merges newly deselected synced PO uuids with a prior delete list on SAVE", async ( ) => {
    // Same as before each but with a prior uuid t delete
    useStore.setState( {
      currentObservation: {
        ...factory( "LocalObservation" ),
        observationFieldValues: [],
        projectObservations: [
          factory( "LocalProjectObservation", {
            projectId: mockProjects[0].id,
          } ),
        ],
      },
    } );

    renderAddToProjects( );

    await actor.press( screen.getByText( mockProjects[0].title ) );
    await actor.press( screen.getByTestId( "AddToProjects.saveButton" ) );

    expect( useStore.getState( ).currentObservation?.projectObservations ).toEqual( [] );
    expect( useStore.getState( ).currentObservation?.projectObservationUuidsToDelete )
      .toEqual( [
        "prior-session-uuid",
        mockProjects[0].uuid,
      ] );
    expect( mockGoBack ).toHaveBeenCalled( );
  } );
} );
