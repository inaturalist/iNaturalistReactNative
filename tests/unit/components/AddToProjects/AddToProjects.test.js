import {
  screen, userEvent, waitFor, within,
} from "@testing-library/react-native";
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

  it( "does not show status banner when a selected project has only optional fields", async ( ) => {
    renderAddToProjects( );

    await actor.press( screen.getByText( mockProjects[1].title ) );

    expect(
      screen.getByText( mockProjects[1].projectObservationFields[0].obsField.name ),
    ).toBeVisible( );
    expect(
      screen.queryByText( "All required fields have been filled" ),
    ).toBeNull( );
    expect(
      screen.queryByText( "To add to this project, all required fields must be filled" ),
    ).toBeNull( );
  } );

  describe( "when a selected project has fields out of position order", ( ) => {
    const originalFields = mockProjects[0].projectObservationFields;
    const unsortedFields = [
      factory( "LocalProjectObservationField", {
        position: 2,
        obsField: factory( "LocalObservationField", { name: "Field C" } ),
      } ),
      factory( "LocalProjectObservationField", {
        position: 0,
        obsField: factory( "LocalObservationField", { name: "Field A" } ),
      } ),
      factory( "LocalProjectObservationField", {
        position: 1,
        obsField: factory( "LocalObservationField", { name: "Field B" } ),
      } ),
    ];

    beforeAll( ( ) => {
      mockProjects[0].projectObservationFields = unsortedFields;
    } );

    afterAll( ( ) => {
      mockProjects[0].projectObservationFields = originalFields;
    } );

    it( "renders fields sorted by position", ( ) => {
      renderAddToProjects( );

      const fieldNames = screen.getAllByText( /Field [ABC]/ ).map(
        node => node.props.children,
      );
      expect( fieldNames ).toEqual( ["Field A", "Field B", "Field C"] );
    } );
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

    expect( screen.getByText( "SAVE" ) ).toBeDisabled( );
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
    expect( mockGoBack ).toHaveBeenCalled( );
  } );

  it( "soft-deletes only the deselected synced project observation", async ( ) => {
    useStore.setState( {
      currentObservation: {
        ...factory( "LocalObservation" ),
        observationFieldValues: [],
        projectObservations: [
          factory( "LocalProjectObservation", {
            projectId: mockProjects[0].id,
            uuid: "po-0-uuid",
            _synced_at: new Date( ),
          } ),
          factory( "LocalProjectObservation", {
            projectId: mockProjects[1].id,
            uuid: "po-1-uuid",
            _synced_at: new Date( ),
          } ),
        ],
      },
    } );

    renderAddToProjects( );

    await actor.press( screen.getByText( mockProjects[0].title ) );
    await actor.press( screen.getByTestId( "AddToProjects.saveButton" ) );

    const savedProjectObservations = useStore.getState( )
      .currentObservation?.projectObservations;

    expect( savedProjectObservations ).toEqual( expect.arrayContaining( [
      expect.objectContaining( {
        projectId: mockProjects[0].id,
        uuid: "po-0-uuid",
        _pendingRemoval: true,
      } ),
      expect.objectContaining( {
        projectId: mockProjects[1].id,
        uuid: "po-1-uuid",
      } ),
    ] ) );
    expect( savedProjectObservations ).toHaveLength( 2 );
    expect(
      savedProjectObservations?.find( po => po.projectId === mockProjects[1].id )?._pendingRemoval,
    ).toBeUndefined( );
    expect( mockGoBack ).toHaveBeenCalled( );
  } );

  describe( "when a selected project has a required field", ( ) => {
    beforeAll( ( ) => {
      mockProjects[1].projectObservationFields[0].required = true;
    } );

    afterAll( ( ) => {
      mockProjects.forEach( project => {
        project.projectObservationFields.forEach( pof => {
          pof.required = false;
        } );
      } );
    } );

    it( "shows a pencil icon on the project row", async ( ) => {
      renderAddToProjects( );

      await actor.press( screen.getByText( mockProjects[1].title ) );

      expect(
        within( screen.getByTestId( `AddToProjects.project.${mockProjects[1].id}` ) )
          .getByText( iconGlyph( "circle-dots-pencil" ) ),
      ).toBeVisible( );
    } );

    it( "shows the incomplete required-fields banner when a required field is empty", async ( ) => {
      renderAddToProjects( );

      await actor.press( screen.getByText( mockProjects[1].title ) );

      expect(
        screen.getByText( "To add to this project, all required fields must be filled" ),
      ).toBeVisible( );
    } );

    it( "shows completed required-fields banner when all required fields are filled", async ( ) => {
      const requiredObsFieldId = mockProjects[1].projectObservationFields[0].obsField.id;
      useStore.setState( {
        currentObservation: {
          ...factory( "LocalObservation" ),
          observationFieldValues: [
            factory( "LocalObservationFieldValue", {
              obsFieldId: requiredObsFieldId,
              value: "completed-value",
            } ),
          ],
          projectObservations: [factory( "LocalProjectObservation", {
            projectId: mockProjects[0].id,
            _synced_at: new Date( ),
          } )],
        },
      } );

      renderAddToProjects( );

      await actor.press( screen.getByText( mockProjects[1].title ) );

      expect(
        screen.getByText( "All required fields have been filled" ),
      ).toBeVisible( );
    } );

    it( "shows Missing info sheet when SAVE is pressed with an empty required field", async ( ) => {
      renderAddToProjects( );

      await actor.press( screen.getByText( mockProjects[1].title ) );

      expect( screen.getByTestId( "AddToProjects.saveButton" ) ).not.toBeDisabled( );
      await actor.press( screen.getByTestId( "AddToProjects.saveButton" ) );

      await waitFor( ( ) => {
        expect( screen.getByTestId( "MissingInfoSheet" ) ).toBeVisible( );
      } );
      expect( mockGoBack ).not.toHaveBeenCalled( );
    } );

    it( "keeps editing when Missing info sheet is dismissed", async ( ) => {
      renderAddToProjects( );

      await actor.press( screen.getByText( mockProjects[1].title ) );
      await actor.press( screen.getByTestId( "AddToProjects.saveButton" ) );
      await actor.press( screen.getByText( "KEEP EDITING" ) );

      await waitFor( ( ) => {
        expect( screen.queryByTestId( "MissingInfoSheet" ) ).toBeNull( );
      } );
      expect( mockGoBack ).not.toHaveBeenCalled( );
    } );

    it( "persists only completed projects when LEAVE is pressed", async ( ) => {
      const sharedObsFieldId = mockProjects[0].projectObservationFields[0].obsField.id;
      // Start with the first project's input completed and saved
      useStore.setState( {
        currentObservation: {
          ...factory( "LocalObservation" ),
          observationFieldValues: [
            factory( "LocalObservationFieldValue", {
              obsFieldId: sharedObsFieldId,
              value: "completed-value",
            } ),
          ],
          projectObservations: [factory( "LocalProjectObservation", {
            projectId: mockProjects[0].id,
            _synced_at: new Date( ),
          } )],
        },
      } );

      renderAddToProjects( );

      // Select the second project but do not complete it
      await actor.press( screen.getByText( mockProjects[1].title ) );
      await actor.press( screen.getByTestId( "AddToProjects.saveButton" ) );
      await waitFor( ( ) => {
        expect( screen.getByTestId( "MissingInfoSheet" ) ).toBeVisible( );
      } );
      await actor.press( screen.getByText( "LEAVE" ) );

      // Expect only the previous state, no additions
      expect(
        useStore.getState( ).currentObservation?.projectObservations?.map( po => po.projectId ),
      ).toEqual( [mockProjects[0].id] );
      expect( useStore.getState( ).currentObservation?.observationFieldValues ).toEqual( [
        expect.objectContaining( {
          obsFieldId: sharedObsFieldId,
          value: "completed-value",
        } ),
      ] );
      await waitFor( ( ) => {
        expect( mockGoBack ).toHaveBeenCalled( );
      } );
    } );

    it( "navigates back when LEAVE is pressed from SAVE with incomplete selections", async ( ) => {
      renderAddToProjects( );

      await actor.press( screen.getByText( mockProjects[1].title ) );
      await actor.press( screen.getByTestId( "AddToProjects.saveButton" ) );
      await waitFor( ( ) => {
        expect( screen.getByTestId( "MissingInfoSheet" ) ).toBeVisible( );
      } );
      await actor.press( screen.getByText( "LEAVE" ) );

      await waitFor( ( ) => {
        expect( mockGoBack ).toHaveBeenCalled( );
      } );
    } );
  } );
} );
