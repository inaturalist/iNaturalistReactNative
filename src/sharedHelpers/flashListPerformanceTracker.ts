class FlashListPerformanceTracker {
  private screenLoadTime: number;

  private itemsVisibleStartTime: number;

  private itemsVisibleDuration: number;

  private scrollEvents: Array<{
    startTime: number;
    endTime: number;
    duration: number;
    itemsFetched: number;
    scrollDistance: number;
  }> = [];

  private currentScrollEvent: unknown = null;

  private fetchStartTime: number;

  private fetchEvents: Array<{
    startTime: number;
    endTime: number;
    duration: number;
    itemsCount: number;
  }> = [];

  private persistentMetrics = {
    lastFetchTime: null as number | null,
    lastFetchTimestamp: 0,
    avgFetchTime: 0,
    fetchCount: 0
  };

  private lastFetchItemCount = 0;

  private totalItemsDisplayed = 0;

  constructor() {
    this.reset();
  }

  reset(): void {
    // Timestamps
    this.screenLoadTime = Date.now();
    this.itemsVisibleStartTime = 0;
    // Calculated durations (in ms)
    this.itemsVisibleDuration = 0;

    this.scrollEvents = [];
    this.currentScrollEvent = null;
    this.fetchStartTime = 0;
    this.fetchEvents = [];

    this.lastFetchItemCount = 0;
    this.totalItemsDisplayed = 0;
  }

  markItemsVisible(): void {
    if ( this.itemsVisibleStartTime === 0 ) {
      this.itemsVisibleStartTime = Date.now();
      this.itemsVisibleDuration = this.itemsVisibleStartTime - this.screenLoadTime;
    }
  }

  beginScrollEvent( y: number ): void {
    // Only one scroll event can be tracked at a time
    if ( !this.currentScrollEvent ) {
      this.currentScrollEvent = {
        startTime: Date.now(),
        endTime: 0,
        duration: 0,
        itemsFetched: 0,
        startY: y,
        endY: y,
        scrollDistance: 0
      };
    }
  }

  endScrollEvent( y: number ): void {
    if ( this.currentScrollEvent ) {
      const now = Date.now();
      this.currentScrollEvent.endTime = now;
      this.currentScrollEvent.duration = now - this.currentScrollEvent.startTime;
      this.currentScrollEvent.endY = y;
      this.currentScrollEvent.scrollDistance = Math.abs( y - this.currentScrollEvent.startY );

      this.scrollEvents.push( this.currentScrollEvent );
      this.currentScrollEvent = null;
    }
  }

  beginDataFetch(): void {
    this.fetchStartTime = Date.now();
  }

  endDataFetch( itemsCount: number ): void {
    if ( this.fetchStartTime > 0 ) {
      const endTime = Date.now();
      const fetchDuration = Date.now() - this.fetchStartTime;
      this.fetchEvents.push( {
        startTime: this.fetchStartTime,
        endTime,
        duration: fetchDuration,
        itemsCount
      } );

      this.persistentMetrics.lastFetchTime = fetchDuration;
      this.persistentMetrics.lastFetchTimestamp = endTime;

      this.persistentMetrics.fetchCount += 1;
      this.persistentMetrics.avgFetchTime
        = ( ( this.persistentMetrics.avgFetchTime
          * ( this.persistentMetrics.fetchCount - 1 ) ) + fetchDuration )
        / this.persistentMetrics.fetchCount;

      this.lastFetchItemCount = itemsCount;

      this.totalItemsDisplayed += itemsCount;
    }
  }

  getLastScrollMetrics() {
    if ( this.scrollEvents.length === 0 ) {
      return null;
    }
    return this.scrollEvents[this.scrollEvents.length - 1];
  }

  getAverageFetchTime() {
    const currentSessionAvg = this.fetchEvents.length > 0
      ? Math.round( this.fetchEvents.reduce( ( sum, event ) => sum + event.duration, 0 )
      / this.fetchEvents.length )
      : 0;

    return Math.max( currentSessionAvg, Math.round( this.persistentMetrics.avgFetchTime ) );
  }

  getLastFetchTime(): number | null {
    if ( this.fetchEvents.length > 0 ) {
      return this.fetchEvents[this.fetchEvents.length - 1].duration;
    }

    return this.persistentMetrics.lastFetchTime;
  }

  getSummary(): {
    listReadyTime: number;
    itemsVisibleTime: number;
    scrollEvents: number;
    avgScrollDuration: number;
    avgFetchTime: number;
    lastFetchTime: number | null;
    } {
    const avg = this.scrollEvents.length > 0
      ? this.scrollEvents.reduce( ( sum, event ) => sum + event.duration, 0 )
        / this.scrollEvents.length
      : 0;

    return {
      itemsVisibleTime: this.itemsVisibleDuration,
      scrollEvents: this.scrollEvents.length,
      avgScrollDuration: Math.round( avg ),
      avgFetchTime: this.getAverageFetchTime(),
      lastFetchTime: this.getLastFetchTime(),
      totalFetches: this.fetchEvents.length
        + this.persistentMetrics.fetchCount - this.fetchEvents.length,
      lastFetchItemCount: this.lastFetchItemCount,
      totalItemsDisplayed: this.totalItemsDisplayed
    };
  }
}

const flashListTracker = new FlashListPerformanceTracker();
export default flashListTracker;
