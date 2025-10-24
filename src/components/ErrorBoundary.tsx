import {
  Body1,
  Button,
  Heading1,
  Heading2
} from "components/SharedComponents";
import {
  SafeAreaView,
  ScrollView
} from "components/styledComponents";
import { t } from "i18next";
import React from "react";
import RNRestart from "react-native-restart";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "ErrorBoundary" );

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
  info: React.ErrorInfo | null;
}

// https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
class ErrorBoundary extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError( error: Error ) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch( error: Error, info: React.ErrorInfo ) {
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
          <ScrollView className="p-5 bg-white">
            <Heading1 className="my-3">{ t( "Something-went-wrong" ) }</Heading1>
            <Body1>
              { t( "If-youre-seeing-this-error" ) }
            </Body1>
            <Button
              text={t( "RESTART-APP" )}
              onPress={( ) => RNRestart.restart()}
              className="my-5"
              level="focus"
            />
            <Heading2 className="mt-5">{ t( "Error" ) }</Heading2>
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
