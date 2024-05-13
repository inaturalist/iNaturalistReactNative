/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
import {
  Body1,
  Heading1,
  Heading2
} from "components/SharedComponents";
import {
  SafeAreaView,
  ScrollView
} from "components/styledComponents";
import React from "react";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "ErrorBoundary" );

// https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
class ErrorBoundary extends React.Component {
  constructor( props ) {
    super( props );
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError( error ) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch( error, info ) {
    this.setState( { info } );
    if ( info?.componentStack ) {
      // componentStack is a little more informative than what's generally in
      // stack, so put that in there before logging
      error.stack = info.componentStack;
    }
    logger.error( error );
  }

  render() {
    if ( this.state.error ) {
      // TODO allow this to take a fallback component as a prop so individual
      // boundaries can customize their error states
      return (
        <SafeAreaView className="flex-1">
          <ScrollView className="p-5">
            <Heading1>Well that's not good</Heading1>
            <Body1>
              Sadly, you're going to have to force-quit the app. Should there
              be a button here to make that easy? Yes. But is it almost 7pm
              on a Wednesday as I am writing this? Also yes.
            </Body1>
            <Heading2 className="mt-5">Error</Heading2>
            <Body1>{ this.state.error.toString( ) }</Body1>
            <Body1>{ this.state.info?.componentStack }</Body1>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
