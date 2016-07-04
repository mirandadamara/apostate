const defaultOptions = {};

export default function( options = {} ) {
  options = Object.assign({}, defaultOptions, options );

  const { Immutable, adapter } = options;

  function map( arr, transform ) {
    return Immutable.List( arr ).map( transform ).toArray();
  }

  return {
    get( path, ...handlers ) {
      handlers = map( handlers, handler => adapter.adapt( handler ) );

      adapter.route( path, handlers );
    },

    use( ...handlers ) {
      handlers = map( handlers, handler => adapter.adapt( handler ) );

      adapter.middleware( handlers );
    },

    navigate( url ) {
      return adapter.navigate( url );
    }
  };
}
