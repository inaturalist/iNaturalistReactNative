import { screen, userEvent } from "@testing-library/react-native";
import DateFilterSection
  from "components/Explore/ExploreV2/components/DateFilterSection";
import initI18next from "i18n/initI18next";
import React from "react";
import { Pressable as MockPressable, Text } from "react-native";
import { renderComponent } from "tests/helpers/render";

jest.mock( "components/SharedComponents/DateTimePicker", () => function (
  { isDateTimePickerVisible, onDatePicked },
) {
  return isDateTimePickerVisible
    ? (
      <MockPressable
        accessibilityRole="button"
        testID="mock-date-picker-confirm"
        onPress={() => onDatePicked( new Date( "2024-03-05T12:00:00" ) )}
      />
    )
    : null;
} );

const actor = userEvent.setup( );

const CHILD_LABEL = "January";

const MODE_VALUES = {
  all: { label: "All", labelCaps: "ALL", value: "all" },
  exact: {
    label: "Exact Date",
    labelCaps: "EXACT DATE",
    text: "Filter by observed on date",
    value: "exact",
  },
  range: { label: "Date Range", labelCaps: "DATE RANGE", value: "range" },
  months: { label: "Months", labelCaps: "MONTHS", value: "months" },
};

const renderSection = ( props = {}, children = null ) => renderComponent(
  <DateFilterSection
    accessibilityLabel="Date observed"
    exactMode="exact"
    headerText="DATE OBSERVED"
    mode="all"
    modeValues={MODE_VALUES}
    onChangeExactDate={jest.fn( )}
    onChangeMode={jest.fn( )}
    onChangeRangeEnd={jest.fn( )}
    onChangeRangeStart={jest.fn( )}
    rangeMode="range"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  >
    {children}
  </DateFilterSection>,
);

beforeAll( async ( ) => {
  await initI18next( );
} );

describe( "DateFilterSection", ( ) => {
  it( "renders the header and the capitalized label of the current mode", ( ) => {
    renderSection( );

    expect( screen.getByText( "DATE OBSERVED" ) ).toBeTruthy( );
    expect( screen.getByLabelText( "Date observed" ) ).toBeTruthy( );
    expect( screen.getByText( "ALL" ) ).toBeTruthy( );
  } );

  it( "shows no date controls when the mode is neither exact nor range", ( ) => {
    renderSection( );

    expect( screen.queryByText( "CHANGE DATE" ) ).toBeNull( );
    expect( screen.queryByText( "CHANGE START DATE" ) ).toBeNull( );
    expect( screen.queryByText( "CHANGE END DATE" ) ).toBeNull( );
  } );

  it( "renders children, e.g. the month checkboxes", ( ) => {
    renderSection( { mode: "months" }, <Text>{CHILD_LABEL}</Text> );

    expect( screen.getByText( CHILD_LABEL ) ).toBeTruthy( );
  } );

  describe( "mode sheet", ( ) => {
    it( "opens a radio button sheet listing every mode", async ( ) => {
      renderSection( );

      await actor.press( screen.getByLabelText( "Date observed" ) );

      expect( screen.getByText( "Exact Date" ) ).toBeTruthy( );
      expect( screen.getByText( "Date Range" ) ).toBeTruthy( );
      expect( screen.getByText( "Months" ) ).toBeTruthy( );
    } );

    it( "calls onChangeMode with the confirmed mode and closes the sheet", async ( ) => {
      const onChangeMode = jest.fn( );
      renderSection( { onChangeMode } );

      await actor.press( screen.getByLabelText( "Date observed" ) );
      await actor.press( screen.getByText( "Date Range" ) );
      await actor.press( screen.getByText( "CONFIRM" ) );

      expect( onChangeMode ).toHaveBeenCalledWith( "range" );
      expect( screen.queryByText( "Date Range" ) ).toBeNull( );
    } );
  } );

  describe( "exact date mode", ( ) => {
    it( "shows the selected date", ( ) => {
      renderSection( { mode: "exact", exactDate: "2024-01-15" } );

      expect( screen.getByText( "2024-01-15" ) ).toBeTruthy( );
      expect( screen.getByText( "CHANGE DATE" ) ).toBeTruthy( );
      expect( screen.queryByText( "CHANGE START DATE" ) ).toBeNull( );
    } );

    it( "calls onChangeExactDate with an ISO date when a date is picked", async ( ) => {
      const onChangeExactDate = jest.fn( );
      renderSection( { mode: "exact", exactDate: "2024-01-15", onChangeExactDate } );

      await actor.press( screen.getByText( "CHANGE DATE" ) );
      await actor.press( screen.getByTestId( "mock-date-picker-confirm" ) );

      expect( onChangeExactDate ).toHaveBeenCalledWith( "2024-03-05" );
    } );
  } );

  describe( "date range mode", ( ) => {
    const RANGE_PROPS = {
      mode: "range",
      rangeStart: "2024-01-15",
      rangeEnd: "2024-02-20",
    };

    it( "shows both ends of the range", ( ) => {
      renderSection( RANGE_PROPS );

      expect( screen.getByText( "2024-01-15" ) ).toBeTruthy( );
      expect( screen.getByText( "2024-02-20" ) ).toBeTruthy( );
      expect( screen.getByText( "CHANGE START DATE" ) ).toBeTruthy( );
      expect( screen.getByText( "CHANGE END DATE" ) ).toBeTruthy( );
      expect( screen.queryByText( "CHANGE DATE" ) ).toBeNull( );
    } );

    it( "calls onChangeRangeStart when a start date is picked", async ( ) => {
      const onChangeRangeStart = jest.fn( );
      const onChangeRangeEnd = jest.fn( );
      renderSection( { ...RANGE_PROPS, onChangeRangeStart, onChangeRangeEnd } );

      await actor.press( screen.getByText( "CHANGE START DATE" ) );
      await actor.press( screen.getByTestId( "mock-date-picker-confirm" ) );

      expect( onChangeRangeStart ).toHaveBeenCalledWith( "2024-03-05" );
      expect( onChangeRangeEnd ).not.toHaveBeenCalled( );
    } );

    it( "calls onChangeRangeEnd when an end date is picked", async ( ) => {
      const onChangeRangeStart = jest.fn( );
      const onChangeRangeEnd = jest.fn( );
      renderSection( { ...RANGE_PROPS, onChangeRangeStart, onChangeRangeEnd } );

      await actor.press( screen.getByText( "CHANGE END DATE" ) );
      await actor.press( screen.getByTestId( "mock-date-picker-confirm" ) );

      expect( onChangeRangeEnd ).toHaveBeenCalledWith( "2024-03-05" );
      expect( onChangeRangeStart ).not.toHaveBeenCalled( );
    } );

    it( "warns when the end date is before the start date", ( ) => {
      renderSection( {
        ...RANGE_PROPS,
        rangeStart: "2024-02-20",
        rangeEnd: "2024-01-15",
        rangeEndBeforeStart: true,
      } );

      expect(
        screen.getByText( "The start date must be before the end date." ),
      ).toBeTruthy( );
    } );

    it( "does not warn when the range is valid", ( ) => {
      renderSection( RANGE_PROPS );

      expect(
        screen.queryByText( "The start date must be before the end date." ),
      ).toBeNull( );
    } );
  } );
} );
