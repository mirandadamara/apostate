const defaultOptions = {};

export default function( options = {} ) {
  options = Object.assign({}, defaultOptions, options );

  const { page, engine } = options;

  return {
    route( path, handlers ) {
      page( path, ...handlers );
    },

    adapt( handler ) {
      return function( context, next ) {
        function dispatch() {
          return engine.dispatch.apply( engine, arguments );
        }

        function completed() {};

        const req = {
          params: context.params
        };

        const res = {
          dispatch,
          completed
        };

        return handler( req, res, next );
      };
    }
  };
}
