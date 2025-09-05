import { EventRegister } from "react-native-event-listeners";
import * as progressTracker from "uploaders/utils/progressTracker";

function mockForTesting( mockEventRegister: Object ): ( ) => void {
  const originalEventRegister = { ...EventRegister };

  Object.keys( mockEventRegister ).forEach( key => {
    if ( typeof mockEventRegister[key] === "function" ) {
      EventRegister[key] = mockEventRegister[key];
    }
  } );

  return ( ) => {
    Object.keys( originalEventRegister ).forEach( key => {
      EventRegister[key] = originalEventRegister[key];
    } );
  };
}

describe( "progressTracker", ( ) => {
  let emitMock;
  let addEventListenerMock;
  let removeEventListenerMock;
  let cleanup;

  beforeEach( ( ) => {
    emitMock = jest.fn( );
    addEventListenerMock = jest.fn( ).mockReturnValue( "test-listener-id" );
    removeEventListenerMock = jest.fn( );

    cleanup = mockForTesting( {
      emit: emitMock,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock
    } );
  } );

  afterEach( ( ) => {
    cleanup( );
    jest.clearAllMocks( );
  } );

  test( "emitProgress should emit an event with observationUUID and increment", ( ) => {
    const observationUUID = "test-uuid";
    const increment = 0.5;

    progressTracker.emitProgress( observationUUID, increment );

    expect( emitMock ).toHaveBeenCalledWith(
      progressTracker.INCREMENT_SINGLE_UPLOAD_PROGRESS,
      [observationUUID, increment]
    );
  } );

  test( "emitProgress should return undefined when not specified", ( ) => {
    const observationUUID = "test-uuid";

    progressTracker.emitProgress( observationUUID );

    expect( emitMock ).toHaveBeenCalledWith(
      progressTracker.INCREMENT_SINGLE_UPLOAD_PROGRESS,
      [observationUUID, undefined]
    );
  } );

  test( "emitProgress should warn and not emit when observationUUID is undefined", ( ) => {
    const consoleSpy = jest.spyOn( console, "warn" ).mockImplementation( );

    progressTracker.emitProgress( undefined, 1 );

    expect( consoleSpy ).toHaveBeenCalled( );
    expect( emitMock ).not.toHaveBeenCalled( );

    consoleSpy.mockRestore( );
  } );

  test( "trackObservationUpload should return start and complete functions", ( ) => {
    const observationUUID = "test-uuid";
    const { start, complete } = progressTracker.trackObservationUpload( observationUUID );

    start( );
    expect( emitMock ).toHaveBeenCalledWith(
      progressTracker.INCREMENT_SINGLE_UPLOAD_PROGRESS,
      [observationUUID, progressTracker.HALF_INCREMENT]
    );

    complete( );
    expect( emitMock ).toHaveBeenCalledTimes( 2 );
    expect( emitMock ).toHaveBeenLastCalledWith(
      progressTracker.INCREMENT_SINGLE_UPLOAD_PROGRESS,
      [observationUUID, progressTracker.HALF_INCREMENT]
    );
  } );

  test( "trackEvidenceUpload should return uploaded and attached functions", ( ) => {
    const observationUUID = "test-uuid";
    const { uploaded, attached } = progressTracker.trackEvidenceUpload( observationUUID );

    uploaded( );
    expect( emitMock ).toHaveBeenCalledWith(
      progressTracker.INCREMENT_SINGLE_UPLOAD_PROGRESS,
      [observationUUID, progressTracker.HALF_INCREMENT]
    );

    attached( );
    expect( emitMock ).toHaveBeenCalledTimes( 2 );
    expect( emitMock ).toHaveBeenLastCalledWith(
      progressTracker.INCREMENT_SINGLE_UPLOAD_PROGRESS,
      [observationUUID, progressTracker.HALF_INCREMENT]
    );
  } );
} );
