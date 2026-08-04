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
import React, { useState } from "react";
import { formatObsFieldDate } from "sharedHelpers/dateAndTime";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const toISODate = ( date: Date ): string => formatObsFieldDate( date );

type OpenSheet = "mode" | "exact" | "start" | "end" | null;

interface ModeOption {
  label: string;
  labelCaps: string;
  text?: string;
  value: string;
}

interface Props {
  accessibilityLabel: string;
  children?: React.ReactNode;
  exactDate?: string | null;
  exactMode: string;
  headerText: string;
  mode: string;
  modeValues: Record<string, ModeOption>;
  onChangeExactDate: ( isoDate: string ) => void;
  onChangeMode: ( mode: string ) => void;
  onChangeRangeEnd: ( isoDate: string ) => void;
  onChangeRangeStart: ( isoDate: string ) => void;
  rangeEnd?: string | null;
  rangeEndBeforeStart?: boolean;
  rangeMode: string;
  rangeStart?: string | null;
}

const DateFilterSection = ( {
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
}: Props ) => {
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
            onChangeMode( String( newMode ) );
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
