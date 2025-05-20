import classnames from "classnames";
import { Body1 } from "components/SharedComponents";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import flashListTracker from "sharedHelpers/flashListPerformanceTracker.ts";
import {
  useDebugMode
} from "sharedHooks";

interface PerformanceDebugViewProps {
  showListMetrics?: boolean;
  showScrollMetrics?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
  refreshInterval?: number | null;
}

const PerformanceDebugView: React.FC<PerformanceDebugViewProps> = ( {
  showListMetrics = true,
  showScrollMetrics = true,
  position = "bottom-left",
  className = "",
  refreshInterval = 1000
} ) => {
  const { isDebug } = useDebugMode( );
  const [, setRefreshCounter] = useState( 0 );
  // Get metrics from trackers
  const listMetrics = flashListTracker.getSummary();

  // Define position classes
  const positionClasses = {
    "top-left": "top-5 left-5",
    "top-right": "top-5 right-5",
    "bottom-left": "bottom-[280px] left-5",
    "bottom-right": "bottom-[280px] right-5"
  };

  useEffect( () => {
    if ( isDebug && refreshInterval !== null ) {
      const interval = setInterval( () => {
        setRefreshCounter( prev => prev + 1 );
      }, refreshInterval );

      return ( ) => clearInterval( interval );
    }
    return ( ) => undefined;
  }, [refreshInterval, isDebug] );

  if ( !isDebug ) {
    return null;
  }

  return (
    <View
      className={classnames(
        "absolute",
        "bg-deeppink",
        "p-2",
        "rounded-md",
        "z-10",
        positionClasses[position],
        className
      )}
    >
      {showListMetrics && (
        <>
          <Body1 className="text-white">
            {`List Ready: ${listMetrics.listReadyTime}ms`}
          </Body1>
          <Body1 className="text-white">
            {`Items Visible: ${
              listMetrics.itemsVisibleTime > 0
                ? `${listMetrics.itemsVisibleTime}ms`
                : "Not yet visible"
            }`}
          </Body1>
        </>
      )}
      {showScrollMetrics && (
        <>
          <Body1 className="text-white">
            {`Scroll Events: ${listMetrics.scrollEvents}`}
          </Body1>
          <Body1 className="text-white">
            {`Avg Scroll Time: ${listMetrics.avgScrollDuration}ms`}
          </Body1>
          <Body1 className="text-white">
            {`Avg Fetch Time: ${listMetrics.avgFetchTime}ms`}
          </Body1>
          {listMetrics.lastFetchTime && (
            <Body1 className="text-white">
              {`Last Fetch: ${listMetrics.lastFetchTime}ms`}
            </Body1>
          )}
        </>
      )}
    </View>
  );
};

export default PerformanceDebugView;
