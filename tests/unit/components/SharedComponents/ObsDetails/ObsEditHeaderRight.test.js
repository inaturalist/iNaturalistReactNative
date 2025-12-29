import { fireEvent, screen } from "@testing-library/react-native";
import ObsEditHeaderRight from "components/SharedComponents/ObsDetails/ObsEditHeaderRight";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();
jest.mock( "@react-navigation/native", () => ( {
  ...jest.requireActual( "@react-navigation/native" ),
  useNavigation: () => ( {
    navigate: mockNavigate,
    setOptions: mockSetOptions,
  } ),
} ) );

describe( "ObsEditHeaderRight", () => {
  const mockObservation = factory( "LocalObservation" );

  beforeEach( () => {
    jest.clearAllMocks();
  } );

  it( "sets navigation header options", () => {
    renderComponent( <ObsEditHeaderRight observation={mockObservation} /> );

    expect( mockSetOptions ).toHaveBeenCalledWith(
      expect.objectContaining( {
        headerRight: expect.any( Function ),
      } ),
    );
  } );

  it( "renders edit button and calls relevant functions on press", () => {
    const prepareObsEdit = jest.fn();
    const setMyObsOffsetToRestore = jest.fn();

    useStore.setState( {
      prepareObsEdit,
      setMyObsOffsetToRestore,
    } );

    renderComponent( <ObsEditHeaderRight observation={mockObservation} /> );

    const headerRightCall = mockSetOptions.mock.calls[0][0];
    const HeaderRightComponent = headerRightCall.headerRight;

    renderComponent( <HeaderRightComponent /> );

    const editButton = screen.getByTestId( "ObsEditIcon" );
    expect( editButton ).toBeVisible();

    fireEvent.press( editButton );

    expect( prepareObsEdit ).toHaveBeenCalledWith( mockObservation );
    expect( mockNavigate ).toHaveBeenCalledWith( "ObsEdit" );
    expect( setMyObsOffsetToRestore ).toHaveBeenCalled();
  } );
} );
