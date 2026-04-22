import classnames from "classnames";
import { Body1 } from "components/SharedComponents";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import flashListTracker from "sharedHelpers/flashListPerformanceTracker";
import {
  useDebugMode,
} from "sharedHooks";

interface PerformanceDebugViewProps {
  showItemCountMetrics?: boolean;
  showListMetrics?: boolean;
  showScrollMetrics?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
  refreshInterval?: number | null;
}

const PerformanceDebugView: React.FC<PerformanceDebugViewProps> = ( {
  showItemCountMetrics = true,
  showListMetrics = true,
  showScrollMetrics = true,
  position = "bottom-left",
  className = "",
  refreshInterval = 1000,
} ) => {
  const { isDebug } = useDebugMode( );
  const [, setRefreshCounter] = useState( 0 );
  const listMetrics = flashListTracker.getSummary();

  // make sure these values aren't undefined when initializing to avoid
  // must be wrapped in <Text /> errors
  const safeListMetrics = {
    itemsVisibleTime: listMetrics?.itemsVisibleTime ?? 0,
    scrollEvents: listMetrics?.scrollEvents ?? 0,
    avgScrollDuration: listMetrics?.avgScrollDuration ?? 0,
    avgFetchTime: listMetrics?.avgFetchTime ?? 0,
    lastFetchTime: listMetrics?.lastFetchTime ?? 0,
    lastFetchItemCount: listMetrics?.lastFetchItemCount ?? 0,
    totalItemsDisplayed: listMetrics?.totalItemsDisplayed ?? 0,
  };

  const positionClasses = {
    "top-left": "top-5 left-5",
    "top-right": "top-5 right-5",
    "bottom-left": "bottom-[280px] left-5",
    "bottom-right": "bottom-[280px] right-5",
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
        className,
      )}
    >
      {showListMetrics && (
        <Body1 className="text-white">
          {`Items Visible: ${
            safeListMetrics.itemsVisibleTime > 0
              ? `${safeListMetrics.itemsVisibleTime}ms`
              : "Not yet visible"
          }`}
        </Body1>
      )}
      {showScrollMetrics && (
        <>
          <Body1 className="text-white">
            {`Scroll Events: ${safeListMetrics.scrollEvents}`}
          </Body1>
          <Body1 className="text-white">
            {`Avg Scroll Time: ${safeListMetrics.avgScrollDuration}ms`}
          </Body1>
          <Body1 className="text-white">
            {`Avg Fetch Time: ${safeListMetrics.avgFetchTime}ms`}
          </Body1>
          <Body1 className="text-white">
            {`Last Fetch: ${safeListMetrics?.lastFetchTime}ms`}
          </Body1>
        </>
      )}
      {showItemCountMetrics && (
        <>
          <Body1 className="text-white">
            {`Last Fetch Items: ${safeListMetrics.lastFetchItemCount}`}
          </Body1>
          <Body1 className="text-white">
            {`Total Items: ${safeListMetrics.totalItemsDisplayed}`}
          </Body1>
        </>
      )}
    </View>
  );
};

export default PerformanceDebugView;
