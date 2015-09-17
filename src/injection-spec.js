import test from 'blue-tape';

import ApostateServer from './server';

test( "Server-Side Apostate", t => suite( t, ApostateServer ) );

// Abstract the test suite for testing of both server-side and client-side libraries.
function suite( t, Apostate ) {
  t.test( "An engine should have an 'inject' method.", ( assert ) => {
    const engine = Apostate();

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

    const engine = Apostate( router );

    engine.inject({
      util: UtilFactory
    });

    engine.route( route => {
      route( '/test', [ action ] );
    });

    function action( state, params, { util }) {
      assert.pass( "Action called." );
      assert.equal( util, Util );
    }

    function Util() {

    }

    function UtilFactory({ session }) {
      assert.pass( "Utility factory called." );
      assert.equal( session, mockSession, "The request session should be available to the utility.")

      return Util;
    }
  });
}
