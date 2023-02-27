import { fireEvent, screen, within } from "@testing-library/react-native";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import initI18next from "i18n/initI18next";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockObservations = [
  factory( "LocalObservation", {
    comments: [
      factory( "LocalComment" ),
      factory( "LocalComment" ),
      factory( "LocalComment" )
    ]
  } ),
  factory( "LocalObservation" )
];

jest.mock( "sharedHooks/useApiToken" );

jest.mock( "sharedHooks/useLocalObservations", () => ( {
  __esModule: true,
  default: () => ( {
    observationList: mockObservations,
    allObsToUpload: []
  } )
} ) );

describe( "MyObservations", () => {
  beforeAll( async () => {
    await initI18next();
  } );

  it( "should not have accessibility errors", () => {
    renderComponent( <MyObservationsContainer /> );
    const obsList = screen.getByTestId( "MyObservationsAnimatedList" );
    expect( obsList ).toBeAccessible();
  } );

  it( "renders an observation", async () => {
    renderComponent( <MyObservationsContainer /> );
    const obs = mockObservations[0];

    const list = await screen.findByTestId( "MyObservationsAnimatedList" );
    // Test that there isn't other data lingering
    expect( list.props.data.length ).toEqual( mockObservations.length );
    // Test that a card got rendered for the our test obs
    const card = await screen.findByTestId( `MyObservations.obsListItem.${obs.uuid}` );
    expect( card ).toBeTruthy();
    // Test that the card has the correct comment count
    const commentCount = within( card ).getByTestId( "ActivityCount.commentCount" );
    // TODO: I disabled node eslint rule here because we will soon have to refactor this
    // test into it's own unit test, because the comment count will be a component
    // after the refactor we should change this line to be in compliance with the eslint rule
    // eslint-disable-next-line testing-library/no-node-access
    expect( commentCount.children[0] ).toEqual( obs.comments.length.toString() );
  } );

  it( "renders multiple observations", async () => {
    renderComponent( <MyObservationsContainer /> );
    // Awaiting the first observation because using await in the forEach errors out
    const firstObs = mockObservations[0];
    await screen.findByTestId( `MyObservations.obsListItem.${firstObs.uuid}` );
    mockObservations.forEach( obs => {
      expect(
        screen.getByTestId( `MyObservations.obsListItem.${obs.uuid}` )
      ).toBeTruthy();
    } );
    // TODO: some things are still happening in the background so I unmount here,
    // better probably to mock away those things happening in the background for this test
    screen.unmount();
  } );

  it( "renders grid view on button press", async () => {
    renderComponent( <MyObservationsContainer /> );
    const button = await screen.findByTestId( "MyObservationsToolbar.toggleGridView" );
    fireEvent.press( button );
    // Awaiting the first observation because using await in the forEach errors out
    const firstObs = mockObservations[0];
    await screen.findByTestId( `MyObservations.gridItem.${firstObs.uuid}` );
    mockObservations.forEach( obs => {
      expect( screen.getByTestId( `MyObservations.gridItem.${obs.uuid}` ) ).toBeTruthy();
    } );
  } );
} );
