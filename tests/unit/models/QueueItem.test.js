import QueueItem from "realmModels/QueueItem";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

const queuedItems = ( ) => global.realm.objects( "QueueItem" ).sorted( "id" );

describe( "QueueItem", ( ) => {
  beforeEach( ( ) => {
    safeRealmWrite( global.realm, ( ) => {
      global.realm.delete( global.realm.objects( "QueueItem" ) );
    }, "clear QueueItems" );
  } );

  it( "should enqueue items with increasing ids", ( ) => {
    QueueItem.enqueue( global.realm, JSON.stringify( { a: 1 } ), "locale-change" );
    QueueItem.enqueue( global.realm, JSON.stringify( { b: 2 } ), "taxon-names-change" );
    expect( queuedItems( ).map( item => item.id ) ).toEqual( [1, 2] );
  } );

  it( "should dequeue the first item with its payload parsed", ( ) => {
    const payload = { id: 7, user: { locale: "fr" } };
    QueueItem.enqueue( global.realm, JSON.stringify( payload ), "locale-change" );
    QueueItem.enqueue( global.realm, JSON.stringify( { id: 8 } ), "taxon-names-change" );
    const dequeued = QueueItem.dequeue( global.realm );
    expect( dequeued.id ).toBe( 1 );
    expect( dequeued.type ).toBe( "locale-change" );
    expect( dequeued.payload ).toEqual( payload );
  } );

  it( "should return null when the queue is empty", ( ) => {
    expect( QueueItem.dequeue( global.realm ) ).toBeNull( );
  } );

  it( "should skip an item that failed in the last minute", ( ) => {
    QueueItem.enqueue( global.realm, JSON.stringify( {} ), "locale-change" );
    QueueItem.markAsFailed( global.realm, 1 );
    expect( queuedItems( )[0].tries ).toBe( 1 );
    expect( queuedItems( )[0].failedAt ).toBeInstanceOf( Date );
    expect( QueueItem.dequeue( global.realm ) ).toBeNull( );
  } );

  it( "should delete an item on its last allowed failure", ( ) => {
    QueueItem.enqueue( global.realm, JSON.stringify( {} ), "locale-change" );
    QueueItem.markAsFailed( global.realm, 1 );
    QueueItem.markAsFailed( global.realm, 1 );
    QueueItem.markAsFailed( global.realm, 1 );
    expect( queuedItems( ) ).toHaveLength( 0 );
  } );

  it( "should delete a dequeued item", ( ) => {
    QueueItem.enqueue( global.realm, JSON.stringify( {} ), "locale-change" );
    QueueItem.deleteDequeuedItem( global.realm, 1 );
    expect( queuedItems( ) ).toHaveLength( 0 );
  } );
} );
