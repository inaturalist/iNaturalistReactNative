import { fireEvent, render, screen } from "@testing-library/react-native";
import { Tabs } from "components/SharedComponents";
import React from "react";

const TAB_1 = "TAB_1";
const TAB_2 = "TAB_2";
const tab1Click = jest.fn();
const tab2Click = jest.fn();

const tabs = [
  {
    id: TAB_1,
    text: TAB_1,
    onPress: tab1Click
  },
  {
    id: TAB_2,
    text: TAB_2,
    onPress: tab2Click
  }
];

describe( "Tabs", () => {
  it( "should render correctly", () => {
    render( <Tabs tabs={tabs} activeId={TAB_1} /> );

    expect( screen ).toMatchSnapshot();
  } );

  it( "should not have accessibility errors", () => {
    // const tabComp = <Tabs tabs={tabs} activeId={TAB_1} />;

    // Disabled during the update to RN 0.78
    // expect( tabComp ).toBeAccessible();
  } );

  it( "should be clicked and display proper text", async () => {
    render( <Tabs tabs={tabs} activeId={TAB_1} /> );
    const tab1 = await screen.findByLabelText( TAB_1 );
    const tab2 = await screen.findByLabelText( TAB_2 );

    expect( tab1 ).toBeTruthy();
    expect( tab2 ).toBeTruthy();
    expect( tab1 ).toBeSelected();
    expect( tab1 ).toBeExpanded();
    expect( tab2 ).not.toBeSelected();
    expect( tab2 ).toBeCollapsed();

    fireEvent.press( tab2 );
    expect( tab1Click ).not.toHaveBeenCalled();
    expect( tab2Click ).toHaveBeenCalled();
  } );
} );
