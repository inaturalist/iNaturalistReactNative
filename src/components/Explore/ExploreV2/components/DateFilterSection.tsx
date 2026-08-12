import classNames from "classnames";
import {
  Body1,
  Button,
  DateTimePicker,
  Heading4,
  INatIcon,
  List2,
  RadioButtonSheet,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { DATE_OBSERVED, DATE_UPLOADED } from "providers/ExploreContext";
import React, { useState } from "react";
import { formatObsFieldDate } from "sharedHelpers/dateAndTime";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const toISODate = ( date: Date ): string => formatObsFieldDate( date );

type OpenSheet = "mode" | "exact" | "start" | "end" | null;

export type DateFilterMode = DATE_OBSERVED | DATE_UPLOADED;

interface ModeOption<TMode extends DateFilterMode> {
  label: string;
  labelCaps: string;
  text?: string;
  value: TMode;
}

interface Props<TMode extends DateFilterMode> extends React.PropsWithChildren {
  accessibilityLabel: string;
  exactDate?: string | null;
  exactMode: TMode;
  headerText: string;
  mode: TMode;
  modeValues: Record<TMode, ModeOption<TMode>> & { [key: string]: ModeOption<TMode> };
  onChangeExactDate: ( isoDate: string ) => void;
  onChangeMode: ( mode: TMode ) => void;
  onChangeRangeEnd: ( isoDate: string ) => void;
  onChangeRangeStart: ( isoDate: string ) => void;
  rangeEnd?: string | null;
  rangeEndBeforeStart?: boolean;
  rangeMode: TMode;
  rangeStart?: string | null;
}

const DateFilterSection = <TMode extends DateFilterMode>( {
  accessibilityLabel,
  children,
  exactDate,
  exactMode,
  headerText,
  mode,
  modeValues,
  onChangeExactDate,
  onChangeMode,
  onChangeRangeEnd,
  onChangeRangeStart,
  rangeEnd,
  rangeEndBeforeStart,
  rangeMode,
  rangeStart,
}: Props<TMode> ) => {
  const { t } = useTranslation( );
  const [openSheet, setOpenSheet] = useState<OpenSheet>( null );
  const closeSheet = ( ) => setOpenSheet( null );

  return (
    <View className="mb-7">
      <Heading4 className="mb-5">{headerText}</Heading4>
      <Button
        text={modeValues[mode]?.labelCaps}
        className="shrink mb-7"
        dropdown
        onPress={( ) => setOpenSheet( "mode" )}
        accessibilityLabel={accessibilityLabel}
      />
      {mode === exactMode && (
        <View className="items-center">
          <Body1 className="mb-5">{exactDate}</Body1>
          <Button
            level="primary"
            text={t( "CHANGE-DATE" )}
            className="w-full mb-7"
            onPress={( ) => setOpenSheet( "exact" )}
            accessibilityLabel={t( "Change-date" )}
          />
          <DateTimePicker
            isDateTimePickerVisible={openSheet === "exact"}
            toggleDateTimePicker={closeSheet}
            onDatePicked={date => onChangeExactDate( toISODate( date ) )}
          />
        </View>
      )}
      {mode === rangeMode && (
        <View className="items-center">
          <Body1
            className={classNames(
              "mb-5",
              rangeEndBeforeStart && "color-warningRed",
            )}
          >
            {rangeStart}
          </Body1>
          <Button
            level="primary"
            text={t( "CHANGE-START-DATE" )}
            className="w-full mb-7"
            onPress={( ) => setOpenSheet( "start" )}
            accessibilityLabel={t( "Change-start-date" )}
          />
          <Body1 className="mb-5">{rangeEnd}</Body1>
          <Button
            level="primary"
            text={t( "CHANGE-END-DATE" )}
            className="w-full mb-7"
            onPress={( ) => setOpenSheet( "end" )}
            accessibilityLabel={t( "Change-end-date" )}
          />
          {rangeEndBeforeStart && (
            <View className="flex-row mb-5">
              <INatIcon
                name="triangle-exclamation"
                size={19}
                color={colors.warningRed}
              />
              <List2 className="ml-3">
                {t( "Start-must-be-before-end" )}
              </List2>
            </View>
          )}
          <DateTimePicker
            isDateTimePickerVisible={openSheet === "start"}
            toggleDateTimePicker={closeSheet}
            onDatePicked={date => onChangeRangeStart( toISODate( date ) )}
          />
          <DateTimePicker
            isDateTimePickerVisible={openSheet === "end"}
            toggleDateTimePicker={closeSheet}
            onDatePicked={date => onChangeRangeEnd( toISODate( date ) )}
          />
        </View>
      )}
      {children}
      {openSheet === "mode" && (
        <RadioButtonSheet
          headerText={headerText}
          confirm={newMode => {
            onChangeMode( newMode );
            closeSheet( );
          }}
          onPressClose={closeSheet}
          radioValues={modeValues}
          selectedValue={mode}
          insideModal
        />
      )}
    </View>
  );
};

export default DateFilterSection;
