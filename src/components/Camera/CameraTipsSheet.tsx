import GoodObservationTips from "components/Camera/GoodObservationTips";
import {
  Body1, Body2, BottomSheet, Heading2, Heading3, INatIcon,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { TFunction } from "i18next";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  onClose: ( ) => void;
}

// Groups of [icon, heading, [title, body] tips], in the order they appear in
// the sheet. Crustaceans and echinoderms have no iconic taxon icon yet, so
// they use the generic animal one.
// Translation keys are long, so lines here can't stay under the max length
/* eslint-disable max-len */
const getCameraTips = ( t: TFunction ): [string, string, [string, string][]][] => [
  ["iconic-plantae", t( "Plants" ), [
    [t( "Whole-plant" ), t( "Step-back-and-get-the-whole-plant-plus-a-bit-of-whats-around-it" )],
    [t( "Leaves" ), t( "Photograph-the-top-and-underside-of-a-leaf-and-where-the-leaves-attach-to-the-stem" )],
    [t( "Flowers-fruit-or-seeds" ), t( "If-the-plant-has-any-get-a-close-up-Identifiers-often-need-these-to-name-the-species" )],
  ]],
  ["iconic-aves", t( "Birds" ), [
    [t( "Head-beak-and-body" ), t( "Try-to-get-the-head-beak-and-body-in-focus-Their-shapes-say-a-lot-about-what-kind-of-bird-it-is" )],
    [t( "Colors-and-markings" ), t( "Look-for-wing-bars-eye-rings-and-patterns-on-the-breast-Similar-species-often-differ-in-just-these" )],
    [t( "Keep-it-sharp" ), t( "Zoom-in-as-far-as-you-can-without-the-photo-getting-blurry-A-clear-photo-from-farther-away-is-more" )],
  ]],
  ["iconic-mammalia", t( "Mammals" ), [
    [t( "Whole-body-from-the-side--mammals" ), t( "Size-shape-and-tail-length-can-tell-identifiers-a-lot-especially-for-larger-mammals" )],
    [t( "Face-ears-and-markings" ), t( "Get-images-of-any-markings-or-patterns-and-the-ear-shape-if-you-can-Keep-your-distance" )],
    [t( "Tracks-and-scat" ), t( "These-count-too-Put-something-near-them-for-scale-like-a-coin-or-your-shoe" )],
  ]],
  ["iconic-reptilia", t( "Reptiles" ), [
    [t( "Back-and-full-body" ), t( "Photograph-the-whole-animal-from-above-so-its-colors-and-pattern-show" )],
    [t( "Head-from-top-and-side--reptiles" ), t( "This-matters-most-for-snakes-since-the-scales-on-the-head-are-often-what-identifiers-use-to-name" )],
    [t( "Stay-safe" ), t( "Dont-handle-or-corner-the-animal-A-photo-from-a-safe-distance-is-still-useful-even-if-its-not" )],
  ]],
  ["iconic-amphibia", t( "Amphibians" ), [
    [t( "Back-of-the-animal" ), t( "Photograph-it-from-above-to-show-its-pattern-and-skin-texture" )],
    [t( "Head-from-top-and-side--amphibians" ), t( "Get-the-eyes-snout-and-any-markings-in-the-shot" )],
    [t( "If-you-can-the-feet" ), t( "Identifiers-sometimes-count-toes-so-try-to-show-the-feet-If-that-would-disturb-the-animal-skip-it" )],
  ]],
  ["iconic-arachnida", t( "Arachnids" ), [
    [t( "Top-view--arachnids" ), t( "Photograph-the-body-from-above-showing-the-abdomen-and-leg-markings" )],
    [t( "Eyes-and-face" ), t( "For-spiders-try-a-head-on-shot-The-way-the-eyes-are-arranged-can-help-identify-the-family" )],
    [t( "Web-burrow-or-surroundings" ), t( "Include-photos-of-the-web-burrow-or-where-you-found-it" )],
  ]],
  ["iconic-insecta", t( "Insects" ), [
    [t( "Top-and-side-views" ), t( "Show-the-body-shape-and-wing-patterns-For-butterflies-try-to-get-the-underside-of-the-wings-too" )],
    [t( "Antennae-legs-and-wings" ), t( "Close-ups-of-these-including-the-veins-on-clear-wings-help-identifiers-sort-out-similar-groups" )],
    [t( "Host-plant" ), t( "For-caterpillars-and-other-plant-feeders-include-a-photo-of-the-plant-theyre-on" )],
  ]],
  ["iconic-mollusca", t( "Mollusks" ), [
    [t( "Shell-from-several-angles" ), t( "Photograph-the-top-the-side-and-the-opening-or-hinge-For-chitons-show-the-plates-and-the-band" )],
    [t( "No-shell-Show-the-body" ), t( "For-slugs-photograph-the-right-side-where-the-breathing-hole-is" )],
    [t( "Body-parts-and-colors" ), t( "Photograph-tentacles-gills-and-the-foot-Their-colors-matter-for-sea-slugs-squid-and-more" )],
  ]],
  ["iconic-fungi", t( "Fungi" ), [
    [t( "Top-of-the-cap" ), t( "Show-the-color-and-texture-of-the-cap-and-its-shape" )],
    [t( "Underside" ), t( "Photograph-the-gills-pores-or-teeth-under-the-cap-Most-mushrooms-cant-be-identified-without-this" )],
    [t( "Stem-and-what-it-grows-on" ), t( "Show-the-very-base-even-if-its-partly-buried-and-whether-its-growing-on-wood-soil-or-leaves" )],
  ]],
  ["iconic-actinopterygii", t( "Fishes" ), [
    [t( "Whole-body-from-the-side--fishes" ), t( "Include-every-fin-and-the-tail-spread-if-you-can-For-flat-fish-like-rays-shoot-from-above-instead" )],
    [t( "Head-close-up" ), t( "Get-the-mouth-eyes-and-any-markings-on-the-head" )],
    [t( "Colors-and-patterns" ), t( "Spots-stripes-and-bars-are-often-what-tells-similar-species-apart" )],
  ]],
  ["iconic-animalia", t( "Echinoderms" ), [
    [t( "Top-view--echinoderms" ), t( "Show-the-full-shape-and-colors-For-sea-stars-include-every-arm" )],
    [t( "Spines-and-texture" ), t( "Get-close-ups-of-the-surface-Small-details-can-separate-similar-sea-stars-and-urchins" )],
    [t( "Keep-it-underwater" ), t( "Photograph-it-in-place-Dont-lift-it-out-of-the-water-or-pry-it-off-rocks" )],
  ]],
  ["iconic-animalia", t( "Crustaceans" ), [
    [t( "Top-view--crustaceans" ), t( "Photograph-the-whole-body-from-above" )],
    [t( "Claws-and-legs" ), t( "Show-their-size-color-and-shape-Similar-crabs-often-differ-here" )],
    [t( "Leave-it-where-you-found-it" ), t( "Dont-pry-crabs-off-rocks-If-you-lift-a-rock-to-look-underneath-put-it-back-gently" )],
  ]],
];
/* eslint-enable max-len */

// Opened from the camera tips button
const CameraTipsSheet = ( { onClose }: Props ) => {
  const { t } = useTranslation( );

  return (
    <BottomSheet onPressClose={onClose} testID="CameraTipsSheet">
      <View className="px-5 pb-5 gap-y-6">
        <View className="gap-y-5">
          <Heading2 accessibilityRole="header" className="underline">
            {t( "How-to-make-a-good-observation" )}
          </Heading2>
          <GoodObservationTips />
        </View>
        <Heading2 accessibilityRole="header" className="underline">
          {t( "What-to-take-a-picture-of" )}
        </Heading2>
        <View className="gap-y-5">
          {getCameraTips( t ).map( ( [icon, heading, tips] ) => (
            <View key={heading} className="gap-y-3.5">
              <View className="flex-row items-center gap-x-2.5">
                <View accessibilityElementsHidden importantForAccessibility="no">
                  <INatIcon name={icon} size={20} color={colors.darkGray} />
                </View>
                <Heading3 accessibilityRole="header">{heading}</Heading3>
              </View>
              {tips.map( ( [title, body] ) => (
                <View key={title} className="gap-y-1.5">
                  <Body1>{title}</Body1>
                  <Body2>{body}</Body2>
                </View>
              ) )}
            </View>
          ) )}
        </View>
      </View>
    </BottomSheet>
  );
};

export default CameraTipsSheet;
