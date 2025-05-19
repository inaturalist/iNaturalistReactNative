class SimpleMapPerformanceTracker {
  constructor() {
    this.reset();
  }

  reset() {
    // Timestamps
    this.screenLoadTime = Date.now();
    this.mapReadyTime = 0;
    this.tilesVisibleTime = 0;

    // Calculated durations (in ms)
    this.mapReadyDuration = 0;
    this.tilesVisibleDuration = 0;
  }

  markMapReady() {
    this.mapReadyTime = Date.now();
    this.mapReadyDuration = this.mapReadyTime - this.screenLoadTime;
  }

  markTilesVisible() {
    if ( this.tilesVisibleTime === 0 ) {
      this.tilesVisibleTime = Date.now();
      this.tilesVisibleDuration = this.tilesVisibleTime - this.screenLoadTime;
    }
  }

  getSummary() {
    return {
      mapReadyTime: this.mapReadyDuration,
      tilesVisibleTime: this.tilesVisibleDuration,
      isComplete: this.tilesVisibleTime > 0 && this.mapReadyTime > 0
    };
  }
}

export const mapTracker = new SimpleMapPerformanceTracker();
export default mapTracker;
