import Immutable from 'immutable';
import { Observable } from 'rx/dist/rx.all';

const defaultOptions = {
  initialize( req ) {
    return Observable.return( Immutable.Map() );
  }
};

export default function( options = {} ) {
  options = Object.assign({}, defaultOptions, options );

  const { app, Engine, config, initialize, render } = options;

  // Add middleware to express app.
  app.use( ( req, res, next ) => {
    initialize( req ).subscribe( initialState => {
      const engine = Engine( Object.assign({ initialState }, config ) );

      function dispatch() {
        return engine.dispatch.apply( engine, arguments );
      }

      function completed() {
        engine.dispatch( state => {
          const { document, status } = render( state, dispatch );

          res.status( status ).send( document );
        });
      };

      engine.state(
        state => {},
        error => next( error )
      );

      Object.assign( req, { state: initialState });
      Object.assign( res, { dispatch, completed });

      next();
    });
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
