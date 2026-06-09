import * as React from "react";

interface StackHostContextValue {
  hasBottomTabBar: boolean;
}

const StackHostContext = React.createContext<StackHostContextValue>( {
  hasBottomTabBar: false,
} );

interface StackHostProviderProps extends React.PropsWithChildren {
  value: StackHostContextValue;
}

export const StackHostProvider = ( {
  children,
  value,
}: StackHostProviderProps ) => (
  <StackHostContext value={value}>{children}</StackHostContext>
);

export function useStackHost( ): StackHostContextValue {
  const context = React.useContext( StackHostContext );
  // Pattern from https://kentcdodds.com/blog/how-to-use-react-context-effectively
  if ( context === undefined ) {
    throw new Error( "useStackHost must be used within an StackHostProvider" );
  }
  return context;
}
