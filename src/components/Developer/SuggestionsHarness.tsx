/* eslint-disable i18next/no-literal-string */
import { useNetInfo } from "@react-native-community/netinfo";
import {
  Button,
  ScrollViewWrapper,
  SwitchRow,
} from "components/SharedComponents";
import {
  fontMonoClass,
  Image,
  Text,
  TextInput,
  View,
} from "components/styledComponents";
import React, { useEffect, useReducer, useState } from "react";
import { launchImageLibrary } from "react-native-image-picker";
import type { UseSuggestionsSuggestion } from "sharedHooks/useSuggestions/types";
import useSuggestionsV2 from "sharedHooks/useSuggestions/useSuggestionsV2";

import {
  CODE, H1, H2, P,
} from "./DeveloperSharedComponents";

// short enough that the online request always loses, to exercise the fallback
const FORCED_TIMEOUT_MS = 1;
const MAX_LOG_ENTRIES = 40;

interface LogEntry {
  at: number;
  text: string;
}

interface LogState {
  inputs: string;
  status: string;
  inputsChangedAt: number;
  entries: LogEntry[];
}

const logReducer = (
  state: LogState,
  action: { inputs: string; status: string; now: number },
): LogState => {
  const entries = [...state.entries];
  let { inputsChangedAt } = state;
  if ( action.inputs !== state.inputs ) {
    inputsChangedAt = action.now;
    entries.push( { at: action.now, text: `--- ${action.inputs}` } );
  }
  entries.push( {
    at: action.now,
    text: `+${action.now - inputsChangedAt}ms ${action.status}`,
  } );
  return {
    inputs: action.inputs,
    status: action.status,
    inputsChangedAt,
    entries: entries.slice( -MAX_LOG_ENTRIES ),
  };
};

const initialLogState: LogState = {
  inputs: "",
  status: "",
  inputsChangedAt: 0,
  entries: [],
};

const formatSuggestion = ( suggestion?: UseSuggestionsSuggestion ) => (
  suggestion
    ? `${suggestion.taxon.name} (${suggestion.taxon.id}) ${suggestion.combined_score?.toFixed( 1 )}`
    : "none"
);

const Row = ( { label, value }: { label: string; value: string } ) => (
  <View className="flex-row">
    <Text className="font-bold">{`${label}: `}</Text>
    <Text
      selectable
      testID={`SuggestionsHarness.${label}`}
      className={`${fontMonoClass} flex-1`}
    >
      {value}
    </Text>
  </View>
);

interface ProbeProps {
  photoUri?: string;
  location: { latitude: number; longitude: number } | null;
  enabled: boolean;
  onlineTimeoutMs?: number;
}

// Owns the hook so the parent can remount it without losing its inputs
const SuggestionsProbe = ( {
  photoUri, location, enabled, onlineTimeoutMs,
}: ProbeProps ) => {
  const {
    suggestions,
    isLoading,
    onlineStatus,
    offlineStatus,
    onlineError,
    offlineError,
    usingOfflineSuggestions,
    urlWillCrashOffline,
    retry,
  } = useSuggestionsV2( {
    photoUri, location, enabled, onlineTimeoutMs,
  } );

  const [log, recordLog] = useReducer( logReducer, initialLogState );
  const inputs = `${photoUri?.split( "/" ).pop( ) ?? "no photo"}`
    + ` loc=${location
      ? `${location.latitude},${location.longitude}`
      : "none"}`
    + ` enabled=${enabled} timeout=${onlineTimeoutMs ?? "default"}`;
  const status = `online=${onlineStatus} offline=${offlineStatus}`;
  useEffect( ( ) => {
    recordLog( { inputs, status, now: Date.now( ) } );
  }, [inputs, status] );

  return (
    <>
      <H2>Status</H2>
      <Row label="isLoading" value={String( isLoading )} />
      <Row label="onlineStatus" value={onlineStatus} />
      <Row label="offlineStatus" value={offlineStatus} />
      <Row label="usingOfflineSuggestions" value={String( usingOfflineSuggestions )} />
      <Row label="urlWillCrashOffline" value={String( urlWillCrashOffline )} />
      <Row label="onlineError" value={onlineError?.message ?? "none"} />
      <Row label="offlineError" value={offlineError?.message ?? "none"} />
      <Button onPress={retry} text="RETRY" className="my-3" />

      <H2>Suggestions</H2>
      <Row label="topSuggestionType" value={suggestions.topSuggestionType} />
      <Row label="top" value={formatSuggestion( suggestions.topSuggestion )} />
      {suggestions.otherSuggestions.map( suggestion => (
        <CODE key={suggestion.taxon.id}>{formatSuggestion( suggestion )}</CODE>
      ) )}

      <H2>Transitions</H2>
      {log.entries.map( entry => (
        <CODE key={`${entry.at}-${entry.text}`}>{entry.text}</CODE>
      ) )}
    </>
  );
};

const SuggestionsHarness = ( ) => {
  const { isConnected } = useNetInfo( );
  const [photoUri, setPhotoUri] = useState<string>( );
  const [uriDraft, setUriDraft] = useState( "" );
  const [sendLocation, setSendLocation] = useState( false );
  const [latitude, setLatitude] = useState( "37.7749" );
  const [longitude, setLongitude] = useState( "-122.4194" );
  const [enabled, setEnabled] = useState( true );
  const [forceTimeout, setForceTimeout] = useState( false );
  const [probeKey, setProbeKey] = useState( 0 );

  const parsedLatitude = Number.parseFloat( latitude );
  const parsedLongitude = Number.parseFloat( longitude );
  const location = sendLocation
    && Number.isFinite( parsedLatitude )
    && Number.isFinite( parsedLongitude )
    ? { latitude: parsedLatitude, longitude: parsedLongitude }
    : null;

  const pickPhoto = async ( ) => {
    const response = await launchImageLibrary( { mediaType: "photo", selectionLimit: 1 } );
    const uri = response.assets?.[0]?.uri;
    if ( uri ) {
      setPhotoUri( uri );
      setUriDraft( uri );
    }
  };

  return (
    <ScrollViewWrapper>
      <View className="p-5">
        <H1>useSuggestionsV2</H1>
        <P>
          Toggle airplane mode to test offline paths. Remounting keeps the
          React Query cache, so the same photo and location reuse the last
          online response.
        </P>
        <Row label="isConnected" value={String( isConnected )} />

        <H2>Photo</H2>
        <Button onPress={pickPhoto} text="PICK PHOTO" className="mb-3" />
        <Button
          onPress={( ) => {
            setPhotoUri( undefined );
            setUriDraft( "" );
          }}
          text="CLEAR PHOTO"
          className="mb-3"
        />
        <TextInput
          className={`${fontMonoClass} border border-lightGray p-2 mb-2`}
          value={uriDraft}
          onChangeText={setUriDraft}
          onEndEditing={( ) => setPhotoUri( uriDraft || undefined )}
          placeholder="or paste a file:// or https:// URI"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Photo URI"
          testID="SuggestionsHarness.photoUri"
        />
        {photoUri && (
          <Image
            source={{ uri: photoUri }}
            className="w-[120px] h-[120px] mb-3"
            accessibilityIgnoresInvertColors
          />
        )}

        <H2>Inputs</H2>
        <SwitchRow
          label="Send location"
          value={sendLocation}
          onValueChange={setSendLocation}
          testID="SuggestionsHarness.sendLocation"
        />
        <View className="flex-row my-2">
          <TextInput
            className={`${fontMonoClass} border border-lightGray p-2 mr-2 flex-1`}
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numbers-and-punctuation"
            accessibilityLabel="Latitude"
          />
          <TextInput
            className={`${fontMonoClass} border border-lightGray p-2 flex-1`}
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numbers-and-punctuation"
            accessibilityLabel="Longitude"
          />
        </View>
        <SwitchRow label="Enabled" value={enabled} onValueChange={setEnabled} />
        <SwitchRow
          label={`Force online timeout (${FORCED_TIMEOUT_MS}ms)`}
          value={forceTimeout}
          onValueChange={setForceTimeout}
          testID="SuggestionsHarness.forceTimeout"
          classNames="mt-3"
        />
        <Button
          onPress={( ) => setProbeKey( key => key + 1 )}
          text="REMOUNT HOOK"
          className="mt-3"
        />

        <SuggestionsProbe
          key={probeKey}
          photoUri={photoUri}
          location={location}
          enabled={enabled}
          onlineTimeoutMs={forceTimeout
            ? FORCED_TIMEOUT_MS
            : undefined}
        />
      </View>
    </ScrollViewWrapper>
  );
};

export default SuggestionsHarness;
