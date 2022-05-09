export default class Record {
  static new( defaults = {} ) {
    return new this( {...defaults} );
  }

  static find( uuid ) {
    try {
      return Record.realm.objectForPrimaryKey( this.schema.name, uuid );
    } catch ( e ) {
      console.log( `Failed to find ${this.schema.name} ${uuid}: `, e );
      return null;
    }
  }

  constructor( attrs ) {
    for ( let k in attrs ) {
      if ( this.constructor.schema.properties[k] ) {
        this[k] = attrs[k];
      }
    }
  }

  save( ) {
    if ( !Record.realm ) {
      throw "Record has not been initialized with Realm";
    }
    if ( Record.realm.isClosed ) {
      throw "Record has a closed copy of Realm";
    }
    // Note, realm.write runs its callback synchoronously somehow so this
    // should return the value the callback returns
    return Record.realm.write(
      ( ) => Record.realm?.create( this.constructor.schema.name, this, "modified" )
    );
  }
}
