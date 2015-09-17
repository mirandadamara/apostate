import test from 'blue-tape';

import ApostateServer from './server';
import ApostateClient from './client';

test( "Server-Side Apostate", t => {
  t.test( "An engine should have an 'inject' method.", ( assert ) => {
    const engine = ApostateServer();

    assert.equals( 'function', typeof engine.inject );
  	assert.end();
  });

  t.test( "Injected utilities should be initialized and available to actions.", assert => {
    assert.plan( 4 );

    const mockSession = {};

    const router = {
      get( path, handler ) {
        // Immediately invoke the handler for test purposes.
        //   handler( req, res next );
        const req = {
          params: {},
          query: {},
          session: mockSession
        };

        const res = {
          send() {},
          status() {}
        };

        function next() {

        }

        handler( req, res, next );
      }
    };

    const engine = ApostateServer( router );

    engine.inject({
      util: UtilFactory
    });

    engine.route( route => {
      route( '/test', [ action ] );
    });

    function action( state, params, { util }) {
      assert.pass( "Action called." );
      assert.equal( util, Util, "The injected utility should be available to the action." );
    }

    function Util() {

    }

    function UtilFactory({ session }) {
      assert.pass( "Utility factory called." );
      assert.equal( session, mockSession, "The request session should be available to the utility.")

      return Util;
    }
  });
});


test( "Client-Side Apostate", t => {
  t.test( "An engine should have an 'inject' method.", ( assert ) => {
    const engine = ApostateClient();

    assert.equals( 'function', typeof engine.inject );
  	assert.end();
  });

  t.test( "Injected utilities should be initialized and available to actions.", assert => {
    assert.plan( 4 );

    const router = function( path, handler ) {
      // Immediately invoke the handler for test purposes.
      //   handler( params );

      handler({});
    };

    const engine = ApostateClient( {}, { router });

    engine.inject({
      util: UtilFactory
    });

    engine.route( route => {
      route( '/test', [ action ] );
    });

    function action( state, params, { util }) {
      assert.pass( "Action called." );
      assert.equal( util, Util, "The injected utility should be available to the action." );
    }

    function Util() {

    }

    function UtilFactory({ session }) {
      assert.pass( "Utility factory called." );
      assert.equal( typeof session, 'undefined', "The session should be undefined on the client.")

      return Util;
    }
  });
});
