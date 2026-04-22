class MapPerformanceTracker {
  private screenLoadTime: number;

  private mapReadyStartTime: number;

  private tilesVisibleStartTime: number;

  private mapReadyDuration: number;

  private tilesVisibleDuration: number;

  constructor( ) {
    this.reset( );
  }

  reset( ): void {
    // Timestamps
    this.screenLoadTime = Date.now();
    this.mapReadyStartTime = 0;
    this.tilesVisibleStartTime = 0;

    // Calculated durations (in ms)
    this.mapReadyDuration = 0;
    this.tilesVisibleDuration = 0;
  }

  markMapReady( ): void {
    this.mapReadyStartTime = Date.now();
    this.mapReadyDuration = this.mapReadyStartTime - this.screenLoadTime;
  }

  markTilesVisible( ): void {
    if ( this.tilesVisibleStartTime === 0 ) {
      this.tilesVisibleStartTime = Date.now();
      this.tilesVisibleDuration = this.tilesVisibleStartTime - this.screenLoadTime;
    }
  }

  getSummary( ): { mapReadyTime: number; tilesVisibleTime: number } {
    return {
      mapReadyTime: this.mapReadyDuration,
      tilesVisibleTime: this.tilesVisibleDuration,
    };
  }
}

const mapTracker = new MapPerformanceTracker( );
export default mapTracker;
