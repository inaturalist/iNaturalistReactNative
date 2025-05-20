class FlashListPerformanceTracker {
  private screenLoadTime: number;

  private listReadyStartTime: number;

  private itemsVisibleStartTime: number;

  private listReadyDuration: number;

  private itemsVisibleDuration: number;

  private scrollEvents: Array<{
    startTime: number;
    endTime: number;
    duration: number;
    itemsFetched: number;
    scrollDistance: number;
  }> = [];

  private currentScrollEvent: unknown = null;

  private fetchStartTime = 0;

  constructor() {
    this.reset();
  }

  reset(): void {
    // Timestamps
    this.screenLoadTime = Date.now();
    this.listReadyStartTime = 0;
    this.itemsVisibleStartTime = 0;
    // Calculated durations (in ms)
    this.listReadyDuration = 0;
    this.itemsVisibleDuration = 0;

    this.scrollEvents = [];
    this.currentScrollEvent = null;
    this.fetchStartTime = 0;
  }

  markListReady(): void {
    this.listReadyStartTime = Date.now();
    this.listReadyDuration = this.listReadyStartTime - this.screenLoadTime;
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
    if ( this.fetchStartTime > 0 && this.currentScrollEvent ) {
      const fetchDuration = Date.now() - this.fetchStartTime;
      this.currentScrollEvent.itemsFetched += itemsCount;
      this.currentScrollEvent.fetchDuration = fetchDuration;
      this.fetchStartTime = 0;
    }
  }

  getLastScrollMetrics() {
    if ( this.scrollEvents.length === 0 ) {
      return null;
    }
    return this.scrollEvents[this.scrollEvents.length - 1];
  }

  getAverageScrollFetchTime() {
    if ( this.scrollEvents.length === 0 ) {
      return 0;
    }

    const eventsWithFetch = this.scrollEvents.filter( event => event.fetchDuration );
    if ( eventsWithFetch.length === 0 ) {
      return 0;
    }

    const totalFetchTime = eventsWithFetch.reduce( ( sum, event ) => sum + event.fetchDuration, 0 );
    return totalFetchTime / eventsWithFetch.length;
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

    const lastEvent = this.getLastScrollMetrics();

    return {
      listReadyTime: this.listReadyDuration,
      itemsVisibleTime: this.itemsVisibleDuration,
      scrollEvents: this.scrollEvents.length,
      avgScrollDuration: Math.round( avg ),
      avgFetchTime: Math.round( this.getAverageScrollFetchTime() ),
      lastFetchTime: lastEvent && lastEvent.fetchDuration
        ? lastEvent.fetchDuration
        : null
    };
  }
}

const flashListTracker = new FlashListPerformanceTracker();
export default flashListTracker;
