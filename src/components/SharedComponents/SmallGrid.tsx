import type { FlashListRef, ListRenderItem, ViewToken } from "@shopify/flash-list";
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

// A row that spans the full width of the grid, for stuff like a loading indicator or an
// error message at the end of a section.
export interface SmallGridSpanRow<S> {
  type: "span";
  key: string;
  itemType?: string;
  content: S;
}

export type SmallGridItem<T, H, S = never> =
  SmallGridHeaderRow<H> | SmallGridTileRow<T> | SmallGridSpanRow<S>;

interface Props<T, H, S> {
  data: SmallGridItem<T, H, S>[];
  listFooterContent?: React.ReactElement | null;
  listHeaderContent?: React.ReactElement | null;
  onEndReached?: ( ) => void;
  onViewableItemsChanged?: ( info: {
    viewableItems: ViewToken<SmallGridItem<T, H, S>>[];
    changed: ViewToken<SmallGridItem<T, H, S>>[];
  } ) => void;
  ref?: React.Ref<FlashListRef<SmallGridItem<T, H, S>>>;
  refreshControl?: React.ReactElement;
  renderHeader: ( header: H ) => React.ReactElement;
  renderSpan?: ( content: S ) => React.ReactElement;
  renderTile: ( tile: T, width: number, height: number ) => React.ReactElement;
  testID?: string;
}

// Maps each tile's index in data to its position within its own section (the
// run of tiles following a header). A header (or span) takes up a whole
// row, so the tiles after it start a fresh row, so a tile's column comes
// from its position in its section, not its index in the whole list.
export function computeTilePositions<T, H, S>(
  data: SmallGridItem<T, H, S>[],
): Map<number, number> {
  const positions = new Map<number, number>( );
  let position = 0;
  data.forEach( ( item, index ) => {
    if ( item.type !== "tile" ) {
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
const SmallGrid = <T, H, S = never, >( {
  data,
  listFooterContent,
  listHeaderContent,
  onEndReached,
  onViewableItemsChanged,
  ref,
  refreshControl,
  renderHeader,
  renderSpan,
  renderTile,
  testID,
}: Props<T, H, S> ) => {
  const { width } = useWindowDimensions( );
  const {
    numColumns, slotWidth, tileSize, lastTileSize,
  } = getSmallGridLayout( width );

  const tilePositions = useMemo( ( ) => computeTilePositions( data ), [data] );

  const getItemType = useCallback(
    ( item: SmallGridItem<T, H, S> ) => (
      item.type === "span"
        ? `span-${item.itemType ?? "default"}`
        : item.type
    ),
    [],
  );

  const overrideItemLayout = useCallback(
    ( layout: { span?: number }, item: SmallGridItem<T, H, S> ) => {
      if ( item.type !== "tile" ) {
        layout.span = numColumns;
      }
    },
    [numColumns],
  );

  const renderItem: ListRenderItem<SmallGridItem<T, H, S>> = useCallback( ( { item, index } ) => {
    if ( item.type === "header" ) {
      return renderHeader( item.header );
    }

    if ( item.type === "span" ) {
      return renderSpan
        ? renderSpan( item.content )
        : null;
    }

    const position = tilePositions.get( index ) ?? 0;
    const isLastInRow = position % numColumns === numColumns - 1;
    const itemWidth = isLastInRow
      ? lastTileSize
      : tileSize;

    return (
      <View
        className="items-start"
        style={{
          width: slotWidth,
          height: tileSize + SMALL_GRID_GAP,
          paddingTop: SMALL_GRID_GAP,
        }}
      >
        {renderTile( item.tile, itemWidth, tileSize )}
      </View>
    );
  }, [
    lastTileSize,
    numColumns,
    renderHeader,
    renderSpan,
    renderTile,
    slotWidth,
    tilePositions,
    tileSize,
  ] );

  const keyExtractor = useCallback(
    ( item: SmallGridItem<T, H, S> ) => item.key,
    [],
  );

  const listFooter = useMemo( ( ) => (
    <>
      {listFooterContent}
      <BottomSpacer />
    </>
  ), [listFooterContent] );

  return (
    <CustomFlashList
      key={numColumns}
      data={data}
      numColumns={numColumns}
      getItemType={getItemType}
      onEndReached={onEndReached}
      onViewableItemsChanged={onViewableItemsChanged}
      overrideItemLayout={overrideItemLayout}
      ref={ref}
      refreshControl={refreshControl}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={listHeaderContent}
      ListFooterComponent={listFooter}
      testID={testID}
    />
  );
};

export default SmallGrid;
