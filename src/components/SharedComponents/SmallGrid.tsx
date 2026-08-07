import type { ListRenderItem } from "@shopify/flash-list";
import { CustomFlashList } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback } from "react";
import { useWindowDimensions } from "react-native";
import { getSmallGridLayout } from "sharedHelpers/smallGridLayout";

interface Props<T> {
  data: T[];
  renderTile: ( item: T, width: number, height: number ) => React.ReactElement;
  keyExtractor: ( item: T, index: number ) => string;
  testID?: string;
}

// Small grid tiles are edge-to-edge (no outer margin) with a fixed gap between them, computed via
// getSmallGridLayout. Each cell's outer wrapper is sized to slotWidth to match FlashList's
// internal column-width math, and the visible tile inside it is rendered smaller and left-aligned,
// so the size difference reads as the gap.
const SmallGrid = <T, >( {
  data,
  renderTile,
  keyExtractor,
  testID,
}: Props<T> ) => {
  const { width } = useWindowDimensions( );
  const {
    numColumns, slotWidth, tileSize, lastTileSize,
  } = getSmallGridLayout( width );

  const renderItem: ListRenderItem<T> = useCallback( ( { item, index } ) => {
    const isLastInRow = ( index % numColumns ) === numColumns - 1;
    const itemWidth = isLastInRow
      ? lastTileSize
      : tileSize;
    const isLastRow = index >= data.length - numColumns;
    return (
      <View
        style={{ width: slotWidth, height: tileSize }}
        className={isLastRow
          ? "items-start"
          : "items-start mb-[3px]"}
      >
        {renderTile( item, itemWidth, tileSize )}
      </View>
    );
  }, [numColumns, slotWidth, tileSize, lastTileSize, renderTile, data.length] );

  return (
    <CustomFlashList
      key={numColumns}
      data={data}
      numColumns={numColumns}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      testID={testID}
    />
  );
};

export default SmallGrid;
