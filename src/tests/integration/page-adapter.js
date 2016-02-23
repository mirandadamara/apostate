import test from 'tape';

import Immutable from 'immutable';
import { Observable } from 'rx/dist/rx.all';

import Engine from '../../engine';
import Router from '../../router';
import PageAdapter from '../../adapters/page';

// Mock page.
function page() {

}

test( "The page adapter", sub => {
  sub.test( "...should expose request parameters on in the req object.", assert => {
    assert.plan( 2 );

    const engine = Engine({});
    const adapter = PageAdapter({ page, engine });

    const handler = adapter.adapt( ( req, res ) => {
      assert.ok( req.params, "A params map should be defined on the req object." );

      const { id } = req.params;

      assert.equal( id, '0000aa', "The correct parameters should be parsed and passed." );
      assert.end();
    });

    const context = {
      params: {
        id: '0000aa'
      }
    };

    function next() {

    }

    handler( context, next );
  });
});
