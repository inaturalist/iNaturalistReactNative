// // https://gist.github.com/hyb175/beb9ceed4c34300ba7c77d3d6d44ae52
export default class Realm {
  constructor( params ) {
    this.schema = {};
    this.callbackList = [];
    this.data = {};
    this.schemaCallbackList = {};
    params.schema.forEach( ( schema ) => {
      this.data[schema.name] = {};
    } );
    params.schema.forEach( ( schema ) => {
      this.schema[schema.name] = schema;
    } );
    this.lastLookedUpModel = null;
  }

  objects( schemaName ) {
    this.lastLookedUpModel = schemaName;
    const objects = Object.values( this.data[schemaName] );
    objects.values = () => objects;
    objects.sorted = () => this.compareFunc ? objects.sort( this.compareFunc ) : objects.sort();
    objects.addListener = ( cb ) => {
      if ( this.schemaCallbackList[schemaName] ) {
        this.schemaCallbackList[schemaName].push( cb );
      } else {
        this.schemaCallbackList[schemaName] = [cb];
      }
    };
    objects.removeListener = () => {};
    objects.filtered = this.filtered ? this.filtered.bind( this, schemaName ) : () => objects;
    return objects;
  }

  // write( fn ) {
  //   this.writing = true;
  //   fn();
  //   this.writing = false;
  // }

  // create( schemaName, object ) {
  //   const modelObject = object;
  //   const properties = this.schema[schemaName].schema.properties;
  //   Object.keys( properties ).forEach( ( key ) => {
  //     if ( modelObject[key] && modelObject[key].model ) {
  //       this.data[modelObject[key].model][modelObject[key].id] = this.create(
  //         modelObject[key].model, modelObject[key],
  //       );
  //     } else if ( modelObject[key] && modelObject[key].length && modelObject[key][0].model ) {
  //       modelObject[key].forEach( ( obj ) => {
  //         this.data[modelObject[key][0].model][obj.id] = obj;
  //       } );
  //       modelObject[key].filtered = this.filtered ? this.filtered : () => modelObject[key];
  //       modelObject[key].sorted = () => modelObject[key].sort();
  //     } else if ( modelObject[key] === undefined ) {
  //       if ( typeof properties[key] === "object" && properties[key].optional ) {
  //         modelObject[key] = null;
  //       }
  //       if ( typeof properties[key] === "object" && ["list", "linkingObjects"].includes( properties[key].type ) ) {
  //         modelObject[key] = [];
  //         modelObject[key].filtered = () => [];
  //         modelObject[key].sorted = () => [];
  //       }
  //     }
  //   } );

  //   this.data[schemaName][modelObject.id] = modelObject;
  //   if ( this.writing ) {
  //     if ( this.schemaCallbackList[schemaName] ) {
  //       this.schemaCallbackList[schemaName].forEach( cb => cb( schemaName, {
  //         insertions: { length: 1 },
  //         modifications: { length: 0 },
  //         deletions: { length: 0 }
  //       } ) );
  //     }
  //     this.callbackList.forEach( ( cb ) => { cb(); } );
  //   }
  //   return modelObject;
  // }

//   objectForPrimaryKey( model, id ) {
//     this.lastLookedUpModel = model;
//     return this.data[model][id];
//   }

//   delete( object ) {
//     if ( this.lastLookedUpModel || object.model ) {
//       const model = object.model ? object.model : this.lastLookedUpModel;
//       if ( Array.isArray( object ) ) {
//         object.forEach( ( item ) => {
//           delete this.data[model][item.id];
//         } );
//       }
//       delete this.data[model][object.id];
//       if ( this.writing ) {
//         if ( this.schemaCallbackList[model] ) {
//           this.schemaCallbackList[model].forEach( cb => cb( model, {
//             insertions: { length: 0 },
//             modifications: { length: 0 },
//             deletions: { length: 1 }
//           } ) );
//         }
//         this.callbackList.forEach( ( cb ) => { cb(); } );
//       }
//     }
//   }

//   deleteAll() {
//     Object.keys( this.schema ).forEach( ( key ) => {
//       if ( this.writing && this.schemaCallbackList[this.schema[key].name] ) {
//         this.schemaCallbackList[this.schema[key].name].forEach( cb => cb( key, {
//           insertions: { length: 0 },
//           modifications: { length: 0 },
//           deletions: { length: Object.values( this.data[this.schema[key].name] ).length }
//         } ) );
//       }
//       this.data[this.schema[key].name] = {};
//     } );
//     if ( this.writing ) {this.callbackList.forEach( ( cb ) => { cb(); } );}
//   }

//   addListener( event, callback ) {
//     this.callbackList.push( callback );
//   }

//   prepareData( schemaName, objects ) {
//     objects.forEach( ( object ) => {
//       this.create( schemaName, object );
//     } );
//   }
}

// Realm.Object = class Object {
//   isValid() { return true; }
// };

Realm.open = ( params ) => {
  return new Promise( ( resolve ) => {
    resolve( new Realm( params ) );
  } );
};
