import type { Namespace } from "i18next";
import React from "react";
import type { TransProps } from "react-i18next";
// eslint-disable-next-line no-restricted-imports
import { Trans as I18nextTrans, useTranslation } from "react-i18next";
import type { TextProps } from "react-native";

// Props Trans doesn't use go to the Text it renders as (initI18next's
// defaultTransParent), so they're Text props
type Props = TransProps<
  string,
  Namespace,
  undefined,
  undefined,
  { context: undefined },
  string,
  TextProps & { className?: string }
>;

// Use this instead of react-i18next's Trans, which reads i18next without
// subscribing to it. The React Compiler caches a Trans whose props don't
// change, so it kept showing what it first rendered after translations loaded
// or the language changed. useTranslation subscribes this wrapper to those
// changes, and its new t re-renders Trans.
const Trans = ( props: Props ) => {
  const { t } = useTranslation( );
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <I18nextTrans t={t} {...props} />;
};

export default Trans;
