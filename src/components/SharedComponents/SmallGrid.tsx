import type { ListRenderItem } from "@shopify/flash-list";
import { CustomFlashList } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback, useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { getSmallGridLayout, SMALL_GRID_GAP } from "sharedHelpers/smallGridLayout";

export interface SmallGridHeaderRow<H> {
  type: "header";
  key: string;
  header: H;
}

export interface SmallGridTileRow<T> {
  type: "tile";
  key: string;
  tile: T;
}

export type SmallGridItem<T, H> = SmallGridHeaderRow<H> | SmallGridTileRow<T>;

interface Props<T, H> {
  data: SmallGridItem<T, H>[];
  listHeaderContent?: React.ReactElement | null;
  renderHeader: ( header: H ) => React.ReactElement;
  renderTile: ( tile: T, width: number, height: number ) => React.ReactElement;
  testID?: string;
}

// Maps each tile's index in data to its position within its own section (the
// run of tiles following a header). A header spans the full row, so the tiles
// after it start a fresh row, so a tile's column comes from its position in
// its section, not its index in the whole list.
function computeTilePositions<T, H>( data: SmallGridItem<T, H>[] ): Map<number, number> {
  const positions = new Map<number, number>( );
  let position = 0;
  data.forEach( ( item, index ) => {
    if ( item.type === "header" ) {
      position = 0;
      return;
    }
    positions.set( index, position );
    position += 1;
  } );
  return positions;
}

const BottomSpacer = ( ) => (
  <View className="h-20" />
);

// Small grid tiles are edge-to-edge (no outer margin) with a fixed gap between them, computed via
// getSmallGridLayout. Each cell's outer wrapper is sized to slotWidth to match FlashList's
// internal column-width math, and the visible tile inside it is rendered smaller and left-aligned,
// so the size difference reads as the gap.
const SmallGrid = <T, H, >( {
  data,
  listHeaderContent,
  renderHeader,
  renderTile,
  testID,
}: Props<T, H> ) => {
  const { width } = useWindowDimensions( );
  const {
    numColumns, slotWidth, tileSize, lastTileSize,
  } = getSmallGridLayout( width );

  const tilePositions = useMemo( ( ) => computeTilePositions( data ), [data] );

  const getItemType = useCallback(
    ( item: SmallGridItem<T, H> ) => item.type,
    [],
  );

  const overrideItemLayout = useCallback(
    ( layout: { span?: number }, item: SmallGridItem<T, H> ) => {
      if ( item.type === "header" ) {
        layout.span = numColumns;
      }
    },
    [numColumns],
  );

  const renderItem: ListRenderItem<SmallGridItem<T, H>> = useCallback( ( { item, index } ) => {
    if ( item.type === "header" ) {
      return renderHeader( item.header );
    }

    const position = tilePositions.get( index ) ?? 0;
    const isLastInRow = position % numColumns === numColumns - 1;
    const isFirstRowInSection = position < numColumns;
    const itemWidth = isLastInRow
      ? lastTileSize
      : tileSize;
    const marginTop = isFirstRowInSection
      ? 0
      : SMALL_GRID_GAP;

    return (
      <View
        className="items-start"
        style={{ width: slotWidth, height: tileSize, marginTop }}
      >
        {renderTile( item.tile, itemWidth, tileSize )}
      </View>
    );
  }, [numColumns, slotWidth, tileSize, lastTileSize, renderHeader, renderTile, tilePositions] );

  const keyExtractor = useCallback(
    ( item: SmallGridItem<T, H> ) => item.key,
    [],
  );

  return (
    <CustomFlashList
      key={numColumns}
      data={data}
      numColumns={numColumns}
      getItemType={getItemType}
      overrideItemLayout={overrideItemLayout}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={listHeaderContent}
      ListFooterComponent={BottomSpacer}
      testID={testID}
    />
  );
};

export default SmallGrid;
