import test from 'tape';
import request from 'supertest';

import express from 'express';

import Immutable from 'immutable';
import { Observable } from 'rx/dist/rx.all';

import Engine from '../../engine';
import Router from '../../router';
import ExpressAdapter from '../../adapters/express';

test( "The Express Adapter", sub => {
  sub.test( "...should append a 'completed' message to 'res' object, that results in rendering and returning a document.", assert => {
    const app = express();

    function initialize( req ) {
      const state = Immutable.fromJS({
        flags: {
          color: 'GREEN'
        }
      });

      return Observable.return( state );
    }

    function render( state ) {
      const document = state.getIn( ['flags', 'color'], 'RED' );

      return {
        document,
        status: 200
      };
    }

    const router = Router({ adapter: ExpressAdapter({ app, Engine, initialize, render }) });

    router.get( '/a', ( req, res, next ) => {
      assert.equal( typeof res.completed, 'function', "The Express Adapter should append a 'completed' method to the 'res' object." );
      assert.equal( typeof res.dispatch, 'function', "The Express Adapter should append a 'dispatch' method to the 'res' object." );

      res.completed();
    });

    request( app ).get( '/a' )
      .end( ( err, res ) => {
        assert.error( err );
        assert.equal( res.text, 'GREEN', "The current state should be reflected by the returned document." );

        assert.end();
      });
  });

  sub.test( "...should catch errors and pass them back into the express router.", assert => {
    const app = express();

    function initialize( req ) {
      const state = Immutable.fromJS({
        flags: {
          color: 'GREEN'
        }
      });

      return Observable.return( state );
    }

    function render( state ) {
      const document = state.getIn( ['flags', 'color'], 'RED' );

      throw new Error( "ExpressAdapter test error." );

      return {
        document,
        status: 200
      };
    }

    const router = Router({ adapter: ExpressAdapter({ app, Engine, initialize, render }) });

    router.get( '/b', ( req, res, next ) => {
      res.completed();
    });

    app.use( ( err, req, res, next ) => {
      assert.ok( err, "An error should be caught." );

      res.status( 500 ).send( 'ERROR' );
    });

    request( app ).get( '/b' )
      .end( ( err, res ) => {
        assert.error( err );
        assert.equal( res.status, 500, "The response status should reflect the error." );
        assert.equal( res.text, 'ERROR', "The error response should be returned." );

        assert.end();
      });
  });

  sub.test( "...should append a snapshot of the current engine state to the 'req' object.", assert => {
    const app = express();

    function initialize( req ) {
      const state = Immutable.fromJS({
        flags: {
          color: 'BLUE'
        }
      });

      return Observable.return( state );
    }

    function render( state ) {
      const document = state.getIn( ['flags', 'color'], 'RED' );

      return {
        document,
        status: 200
      };
    }

    const router = Router({ adapter: ExpressAdapter({ app, Engine, initialize, render }) });

    router.get( '/c', ( req, res, next ) => {
      const { state } = req;

      assert.ok( state, "An immutable state object should be attached to the 'req' object." );
      assert.equal( state.getIn( ['flags', 'color'] ), 'BLUE', "The state object should reflect the state at the time of the request." );

      res.completed();
    });

    request( app ).get( '/c' )
      .end( ( err, res ) => {
        assert.error( err );
        assert.equal( res.text, 'BLUE', "The current state should be reflected by the returned document." );

        assert.end();
      });
  });

  sub.test( "...should create an engine using the configuration options provided.", assert => {
    assert.plan( 2 );
    assert.timeoutAfter( 1000 );

    const app = express();

    function initialize( req ) {
      return Observable.return({});
    }

    function render( state ) {
      return {
        document: 'OK',
        status: 200
      };
    }

    const config = {
      actions: {
        'test:action-b': function( state, params ) {
          assert.pass( "The action was executed." );
        }
      }
    }

    const router = Router({ adapter: ExpressAdapter({ app, Engine, config, initialize, render }) });

    router.get( '/d', ( req, res, next ) => {
      res.dispatch( 'test:action-b' );
      res.completed();
    });

    request( app ).get( '/d' )
      .end( ( err, res ) => {
        assert.error( err );

        assert.end();
      });
  });
});
