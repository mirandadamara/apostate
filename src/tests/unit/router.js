import test from 'tape';

import Router from '../../router';

test( "A router can be instantiated.", assert => {
  const router = Router();

  assert.ok( router, "A router instance should be returned by the factory function." );
  assert.equal( typeof router.get, 'function', "A router should expose a 'get' method." );
  assert.end();
});

test( "A router should apply the provided adapter to each route added.", assert => {
  const routes = [];
  const handlers = [];

  const adapter = {
    route( path, handlers ) {
      routes.push({ path, handlers });
    },

    adapt( handler ) {
      handlers.push( handler );
    }
  };

  const handler1 = function() {};
  const handler2 = function() {};

  const router = Router({ adapter });

  router.get( '/a', handler1, handler2 );

  assert.equal( routes.length, 1, "Exactly one route should have been processed." );
  assert.equal( routes[0].path, '/a', "The correct route should have been passed." );

  assert.equal( handlers.length, 2, "Exactly two handlers should have been wrapped." );
  assert.equal( handlers[0], handler1, "The correct handlers should have been wrapped." );
  assert.equal( handlers[1], handler2, "The correct handlers should have been wrapped." );

  assert.end();
});
