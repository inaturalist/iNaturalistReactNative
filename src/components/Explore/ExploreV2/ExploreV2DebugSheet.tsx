/* eslint-disable i18next/no-literal-string */
import classnames from "classnames";
import type {
  ExploreV2QueryParams,
} from "components/Explore/ExploreV2/buildQueryParams";
import Modal from "components/SharedComponents/Modal";
import Body3 from "components/SharedComponents/Typography/Body3";
import Heading4 from "components/SharedComponents/Typography/Heading4";
import {
  Pressable, ScrollView, Text, View,
} from "components/styledComponents";
import type { ExploreV2State } from "providers/ExploreV2Context";
import {
  defaultExploreV2Location,
  EXPLORE_V2_ACTION,
  EXPLORE_V2_PLACE_MODE,
  EXPLORE_V2_SORT,
  useExploreV2,
} from "providers/ExploreV2Context";
import React from "react";

const TAXA = [
  { id: 47126, name: "Plantae" },
  { id: 3, name: "Aves" },
  { id: 47158, name: "Insecta" },
];

const USERS = [
  { id: 6746956, login: "seth_msp" },
];

const PROJECTS = [
  { id: 42778, title: "Appropriate signs project" },
];

const PLACES = [
  { id: 1, display_name: "United States" },
  { id: 6712, display_name: "Canada" },
];

const SCROLL_CONTENT = { paddingBottom: 32 };

const SORT_LABELS: Record<EXPLORE_V2_SORT, string> = {
  [EXPLORE_V2_SORT.DATE_UPLOADED_NEWEST]: "Uploaded ↓",
  [EXPLORE_V2_SORT.DATE_UPLOADED_OLDEST]: "Uploaded ↑",
  [EXPLORE_V2_SORT.DATE_OBSERVED_NEWEST]: "Observed ↓",
  [EXPLORE_V2_SORT.DATE_OBSERVED_OLDEST]: "Observed ↑",
  [EXPLORE_V2_SORT.MOST_FAVED]: "Most faved",
};

interface DebugButtonProps {
  label: string;
  onPress: () => void;
  active?: boolean;
}

const DebugButton = ( { label, onPress, active }: DebugButtonProps ) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    className={`px-3 py-2 mr-2 mb-2 rounded ${
      active
        ? "bg-inatGreen"
        : "bg-darkGray"
    }`}
  >
    <Text className="text-white text-xs">{label}</Text>
  </Pressable>
);

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ( { title, children }: SectionProps ) => (
  <View className="mb-3">
    <Heading4 className="mb-2">{title}</Heading4>
    <View className="flex-row flex-wrap">{children}</View>
  </View>
);

interface Props {
  visible: boolean;
  onClose: () => void;
  state: ExploreV2State;
  queryParams: ExploreV2QueryParams;
}

const ExploreV2DebugSheet = ( {
  visible,
  onClose,
  state,
  queryParams,
}: Props ) => {
  const { dispatch } = useExploreV2();

  const subjectType = state.subject?.type;
  let subjectId: number | null = null;
  if ( state.subject?.type === "taxon" ) subjectId = state.subject.taxon.id;
  else if ( state.subject?.type === "user" ) subjectId = state.subject.user.id;
  else if ( state.subject?.type === "project" ) subjectId = state.subject.project.id;

  const { placeMode } = state.location;
  const placeId = placeMode === EXPLORE_V2_PLACE_MODE.PLACE
    ? state.location.place.id
    : null;

  const handleNearby = async () => {
    const next = await defaultExploreV2Location();
    if ( next.placeMode === EXPLORE_V2_PLACE_MODE.NEARBY ) {
      dispatch( {
        type: EXPLORE_V2_ACTION.SET_LOCATION_NEARBY,
        lat: next.lat,
        lng: next.lng,
        radius: next.radius,
      } );
    } else {
      dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE } );
    }
  };

  return (
    <Modal
      showModal={visible}
      closeModal={onClose}
      disableSwipeDirection
      modal={(
        <View className="bg-white rounded-t-2xl h-[85%]">
          <View
            className={classnames(
              "px-4 pt-4 pb-2 flex-row items-center justify-between",
              "border-b border-lightGray",
            )}
          >
            <Heading4>ExploreV2 Debug</Heading4>
            <Pressable accessibilityRole="button" onPress={onClose}>
              <Text className="text-base text-inatGreen">Close</Text>
            </Pressable>
          </View>
          <ScrollView
            className="flex-1 px-4 py-3"
            contentContainerStyle={SCROLL_CONTENT}
          >
            <Section title="Subject">
              {TAXA.map( taxon => (
                <DebugButton
                  key={`taxon-${taxon.id}`}
                  label={`Taxon: ${taxon.name}`}
                  active={subjectType === "taxon" && subjectId === taxon.id}
                  onPress={() => dispatch( {
                    type: EXPLORE_V2_ACTION.SET_SUBJECT,
                    subject: { type: "taxon", taxon },
                  } )}
                />
              ) )}
              {USERS.map( user => (
                <DebugButton
                  key={`user-${user.id}`}
                  label={`User: ${user.login}`}
                  active={subjectType === "user" && subjectId === user.id}
                  onPress={() => dispatch( {
                    type: EXPLORE_V2_ACTION.SET_SUBJECT,
                    subject: { type: "user", user },
                  } )}
                />
              ) )}
              {PROJECTS.map( project => (
                <DebugButton
                  key={`project-${project.id}`}
                  label={`Project: ${project.title}`}
                  active={subjectType === "project" && subjectId === project.id}
                  onPress={() => dispatch( {
                    type: EXPLORE_V2_ACTION.SET_SUBJECT,
                    subject: { type: "project", project },
                  } )}
                />
              ) )}
              <DebugButton
                label="Clear subject"
                active={!subjectType}
                onPress={() => dispatch( { type: EXPLORE_V2_ACTION.CLEAR_SUBJECT } )}
              />
            </Section>

            <Section title="Location">
              <DebugButton
                label="Worldwide"
                active={placeMode === EXPLORE_V2_PLACE_MODE.WORLDWIDE}
                onPress={() => dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE } )}
              />
              <DebugButton
                label="Nearby (re-fetch)"
                active={placeMode === EXPLORE_V2_PLACE_MODE.NEARBY}
                onPress={handleNearby}
              />
              {PLACES.map( place => (
                <DebugButton
                  key={`place-${place.id}`}
                  label={`Place: ${place.display_name}`}
                  active={placeMode === EXPLORE_V2_PLACE_MODE.PLACE && placeId === place.id}
                  onPress={() => dispatch( {
                    type: EXPLORE_V2_ACTION.SET_LOCATION_PLACE,
                    place,
                  } )}
                />
              ) )}
            </Section>

            <Section title="Sort">
              {Object.values( EXPLORE_V2_SORT ).map( sort => (
                <DebugButton
                  key={sort}
                  label={SORT_LABELS[sort]}
                  active={state.sortBy === sort}
                  onPress={() => dispatch( {
                    type: EXPLORE_V2_ACTION.SET_SORT,
                    sortBy: sort,
                  } )}
                />
              ) )}
            </Section>

            <Section title="Reset">
              <DebugButton
                label="RESET (back to UNINITIALIZED)"
                onPress={() => dispatch( { type: EXPLORE_V2_ACTION.RESET } )}
              />
            </Section>

            <Heading4 className="mb-1">State</Heading4>
            <Body3 className="font-mono mb-3">
              {JSON.stringify( state, null, 2 )}
            </Body3>
            <Heading4 className="mb-1">Query params</Heading4>
            <Body3 className="font-mono">
              {JSON.stringify( queryParams, null, 2 )}
            </Body3>
          </ScrollView>
        </View>
      )}
    />
  );
};

export default ExploreV2DebugSheet;
