import Immutable from 'immutable';
import { Observable } from 'rx/dist/rx.all';

const defaultOptions = {
  session( req ) {
    return Observable.return( Immutable.Map() );
  }
};

export default function( options = {} ) {
  options = Object.assign({}, defaultOptions, options );

  const { app, Engine, session, render } = options;

  // Add middleware to express app.
  app.use( ( req, res, next ) => {
    session( req ).subscribe( initialState => {
      const engine = Engine({ initialState });

      function dispatch() {
        return engine.dispatch.apply( engine, arguments );
      }

      function completed() {
        engine.dispatch( state => {
          const { document, status } = render( state );

          res.status( status ).send( document );
        });
      };

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
