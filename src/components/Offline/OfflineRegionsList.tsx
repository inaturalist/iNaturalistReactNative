import { stat } from "@dr.pogodin/react-native-fs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Heading4,
  INatIcon,
  INatIconButton,
  ViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import type { ListRenderItemInfo } from "react-native";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import type OfflineRegion from "realmModels/OfflineRegion";
import { useTranslation } from "sharedHooks";
import useOfflineRegions from "sharedHooks/useOfflineRegions";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadow();

const { useQuery } = RealmContext;

const formatBytes = ( bytes: number ): string => {
  if ( bytes < 1024 ) { return `${bytes} B`; }
  if ( bytes < 1024 * 1024 ) { return `${( bytes / 1024 ).toFixed( 1 )} KB`; }
  return `${( bytes / ( 1024 * 1024 ) ).toFixed( 1 )} MB`;
};

const styles = StyleSheet.create( {
  headerShadow: DROP_SHADOW,
  cancelButton: { paddingRight: 12 },
  cancelText: { color: colors.inatGreen, fontSize: 16 },
  deleteButton: { paddingLeft: 12 },
  selectButton: { paddingLeft: 12 },
  selectText: { color: colors.inatGreen, fontSize: 16 },
  selectionCheckbox: { marginRight: 10 },
  allSpeciesBox: {
    width: 62,
    height: 62,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lightGray,
  },
  allSpeciesBoxSelected: {
    width: 62,
    height: 62,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8f5d0",
    borderWidth: 2,
    borderColor: colors.inatGreen,
  },
  allSpeciesText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.mediumGray,
    textAlign: "center",
    marginTop: 4,
  },
  taxonImage: {
    width: 62,
    height: 62,
    borderRadius: 8,
  },
  taxonImageSelected: {
    width: 62,
    height: 62,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.inatGreen,
  },
  rowTrash: { padding: 6 },
  deleteAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  deleteAllText: { color: colors.warningRed, fontWeight: "600", fontSize: 14 },
  deleteTextEnabled: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.warningRed,
  },
  deleteTextDisabled: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.mediumGray,
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    backgroundColor: "#fafafa",
    gap: 10,
  },
  selectAllText: { fontSize: 14, color: colors.darkGray },
  statsRow: { marginTop: 2 },
  statsText: { color: colors.mediumGray, fontSize: 11 },
  queryLabelRow: { marginTop: 4 },
  queryLabelChip: {
    alignSelf: "flex-start",
    backgroundColor: "#e8f5d0",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  queryLabelText: { fontSize: 10, color: colors.inatGreen, fontWeight: "600" },
} );

interface RegionRowProps {
  item: OfflineRegion;
  isSelecting: boolean;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onDeletePress: () => void;
}

const RegionRow = React.memo( ( {
  item,
  isSelecting,
  isSelected,
  onPress,
  onLongPress,
  onDeletePress,
}: RegionRowProps ) => {
  const { t } = useTranslation();
  const [fileSize, setFileSize] = useState<number | null>( null );

  useEffect( () => {
    let cancelled = false;
    if ( item.snapshotPath ) {
      stat( item.snapshotPath )
        .then( info => { if ( !cancelled ) { setFileSize( info.size ); } } )
        .catch( () => { /* file may not exist yet */ } );
    }
    return () => { cancelled = true; };
  }, [item.snapshotPath] );

  const dateStr = item.savedAt.toLocaleDateString( undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  } );

  const obsCount = item.observations.length;

  // Snapshot file + ~300 bytes per observation for Realm storage
  const estimatedSize = ( fileSize ?? 0 ) + obsCount * 300;
  const sizeStr = formatBytes( estimatedSize );

  const statsText = [
    dateStr,
    `${obsCount} ${t( "Observations" )}`,
    sizeStr,
  ].join( "  ·  " );

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center p-3 border-b border-lightGray bg-white"
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Selection checkbox */}
      {isSelecting && (
        <View style={styles.selectionCheckbox}>
          <INatIcon
            name={isSelected
              ? "checkmark-circle"
              : "checkmark-circle-outline"}
            size={24}
            color={isSelected
              ? colors.inatGreen
              : colors.mediumGray}
          />
        </View>
      )}

      {/* Taxon image thumbnail (or map icon fallback) */}
      {item.taxonImagePath
        ? (
          <Image
            source={{ uri: item.taxonImagePath }}
            style={isSelected
              ? styles.taxonImageSelected
              : styles.taxonImage}
            resizeMode="cover"
          />
        )
        : (
          <View style={isSelected
            ? styles.allSpeciesBoxSelected
            : styles.allSpeciesBox}
          >
            <INatIcon name="leaf" size={22} color={colors.inatGreen} />
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <Text style={styles.allSpeciesText}>All Species</Text>
          </View>
        )}

      {/* Info */}
      <View className="flex-1 ml-3">
        <Text className="text-darkGray font-bold text-sm" numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            {statsText}
          </Text>
        </View>
        {item.queryLabel != null && (
          <View style={styles.queryLabelRow}>
            <View style={styles.queryLabelChip}>
              <Text style={styles.queryLabelText} numberOfLines={1}>
                {item.queryLabel}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Per-row trash (normal mode only) */}
      {!isSelecting && (
        <INatIconButton
          icon="trash"
          onPress={onDeletePress}
          accessibilityLabel={t( "Delete-saved-map" )}
          style={styles.rowTrash}
        />
      )}
    </Pressable>
  );
} );

const OfflineRegionsList = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<Record<string, object>>>();
  const { deleteRegion } = useOfflineRegions();

  const [isSelecting, setIsSelecting] = useState( false );
  const [selectedIds, setSelectedIds] = useState<Set<string>>( new Set() );

  const regions = useQuery<OfflineRegion>(
    "OfflineRegion",
    collection => collection.sorted( "savedAt", true ),
  );

  const regionList = Array.from( regions );

  // --- Selection helpers ---
  const enterSelectMode = useCallback( () => {
    setIsSelecting( true );
    setSelectedIds( new Set() );
  }, [] );

  const exitSelectMode = useCallback( () => {
    setIsSelecting( false );
    setSelectedIds( new Set() );
  }, [] );

  const toggleItem = useCallback( ( id: string ) => {
    setSelectedIds( prev => {
      const next = new Set( prev );
      if ( next.has( id ) ) { next.delete( id ); } else { next.add( id ); }
      return next;
    } );
  }, [] );

  const allSelected = regionList.length > 0 && selectedIds.size === regionList.length;

  const toggleSelectAll = useCallback( () => {
    setSelectedIds(
      allSelected
        ? new Set()
        : new Set( regionList.map( r => r.id ) ),
    );
  }, [allSelected, regionList] );

  // --- Delete helpers ---
  const deleteSelected = useCallback( () => {
    const count = selectedIds.size;
    if ( count === 0 ) { return; }
    Alert.alert(
      t( "Delete-Saved-Maps" ),
      t( "Delete-count-saved-maps", { count } ),
      [
        { text: t( "Cancel" ), style: "cancel" },
        {
          text: t( "Delete" ),
          style: "destructive",
          onPress: async () => {
            await Promise.all( Array.from( selectedIds ).map( id => deleteRegion( id ) ) );
            exitSelectMode();
          },
        },
      ],
    );
  }, [selectedIds, deleteRegion, exitSelectMode, t] );

  const deleteAll = useCallback( () => {
    const count = regionList.length;
    if ( count === 0 ) { return; }
    Alert.alert(
      t( "Delete-All-Saved-Maps" ),
      t( "Delete-all-count-saved-maps", { count } ),
      [
        { text: t( "Cancel" ), style: "cancel" },
        {
          text: t( "Delete-All" ),
          style: "destructive",
          onPress: async () => {
            await Promise.all( regionList.map( region => deleteRegion( region.id ) ) );
            exitSelectMode();
          },
        },
      ],
    );
  }, [regionList, deleteRegion, exitSelectMode, t] );

  // --- Row renderer ---
  const renderItem = useCallback( ( { item }: ListRenderItemInfo<OfflineRegion> ) => {
    const isSelected = selectedIds.has( item.id );

    const handlePress = () => {
      if ( isSelecting ) {
        toggleItem( item.id );
      } else {
        navigation.navigate( "OfflineMapView", { regionId: item.id } );
      }
    };

    const handleLongPress = () => {
      if ( !isSelecting ) {
        enterSelectMode();
        toggleItem( item.id );
      }
    };

    const handleDeletePress = () => Alert.alert(
      t( "Delete-Saved-Map" ),
      t( "Delete-region-name", { name: item.name } ),
      [
        { text: t( "Cancel" ), style: "cancel" },
        {
          text: t( "Delete" ),
          style: "destructive",
          onPress: () => deleteRegion( item.id ),
        },
      ],
    );

    return (
      <RegionRow
        item={item}
        isSelecting={isSelecting}
        isSelected={isSelected}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onDeletePress={handleDeletePress}
      />
    );
  }, [isSelecting, selectedIds, toggleItem, navigation, enterSelectMode, deleteRegion, t] );

  // --- List footer: Delete All button (only in normal mode with items) ---
  const ListFooter = !isSelecting && regionList.length > 0
    ? (
      <TouchableOpacity
        accessibilityRole="button"
        onPress={deleteAll}
        style={styles.deleteAllButton}
      >
        <INatIcon name="trash" size={18} color={colors.warningRed} />
        <Text style={styles.deleteAllText}>
          {t( "Delete-All-Maps" )}
        </Text>
      </TouchableOpacity>
    )
    : null;

  return (
    <ViewWrapper>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b border-lightGray bg-white"
        style={DROP_SHADOW}
      >
        {isSelecting
          ? (
            <>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={exitSelectMode}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>{t( "Cancel" )}</Text>
              </TouchableOpacity>
              <Text className="flex-1 font-bold text-base text-darkGray">
                {selectedIds.size === 0
                  ? t( "Select-Maps" )
                  : t( "X-selected", { count: selectedIds.size } )}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={deleteSelected}
                disabled={selectedIds.size === 0}
                style={styles.deleteButton}
              >
                <Text
                  style={
                    selectedIds.size === 0
                      ? styles.deleteTextDisabled
                      : styles.deleteTextEnabled
                  }
                >
                  {t( "Delete" )}
                </Text>
              </TouchableOpacity>
            </>
          )
          : (
            <>
              <INatIconButton
                icon="chevron-left"
                onPress={() => navigation.goBack()}
                accessibilityLabel={t( "Back" )}
              />
              <Heading4 className="ml-2 flex-1">{t( "Saved-Offline-Maps" )}</Heading4>
              {regionList.length > 0 && (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={enterSelectMode}
                  style={styles.selectButton}
                >
                  <Text style={styles.selectText}>{t( "Select" )}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
      </View>

      {/* Select All row (selection mode only) */}
      {isSelecting && regionList.length > 0 && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={toggleSelectAll}
          style={styles.selectAllRow}
        >
          <INatIcon
            name={
              allSelected
                ? "checkmark-circle"
                : "checkmark-circle-outline"
            }
            size={22}
            color={
              allSelected
                ? colors.inatGreen
                : colors.mediumGray
            }
          />
          <Text style={styles.selectAllText}>
            {allSelected
              ? t( "Deselect-All" )
              : t( "Select-All" )}
          </Text>
        </TouchableOpacity>
      )}

      {regions.length === 0
        ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-mediumGray text-center text-base">
              {t( "No-saved-maps-yet" )}
            </Text>
          </View>
        )
        : (
          <FlatList
            data={regionList}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListFooterComponent={ListFooter}
            extraData={selectedIds}
          />
        )}
    </ViewWrapper>
  );
};

export default OfflineRegionsList;
