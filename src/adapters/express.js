import Immutable from 'immutable';

const defaultOptions = {
  session( req ) {
    return Immutable.Map();
  }
};

export default function( options = {} ) {
  options = Object.assign({}, defaultOptions, options );

  const { app, Engine, session, render } = options;

  // Add middleware to express app.
  app.use( ( req, res, next ) => {
    const initialState = session( req );

    const engine = Engine({ initialState });

    function dispatch() {
      return engine.dispatch.apply( engine, arguments );
    }

    function completed() {
      engine.dispatch( state => {
        res.send( render( state ) );
      });
    };

    Object.assign( res, { dispatch, completed });

    next();
  });

  return {
    route( path, handlers ) {
      app.get( path, ...handlers );
    },

    adapt( handler ) {
      return handler;
    }
  };
}
