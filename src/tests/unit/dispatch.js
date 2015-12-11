import test from 'tape';

import Engine from '../../client';

test( "The dispatcher", sub => {
  sub.test( "...should accept anonymous actions.", assert => {
    assert.plan( 5 );

    const engine = Engine();

    assert.equal( typeof engine.state, 'function', "An engine should expose a state method.")
    assert.equal( typeof engine.dispatch, 'function', "An engine should expose a dispatch method." );

    engine.state( state => {
      assert.pass( "A new state should be emitted." );
      assert.equal( state.getIn( ['test', 'A'] ), true, "The emitted state should reflect the changes made by the action." );

      assert.end();
    });

    engine.dispatch( state => {
      assert.pass( "The dispatched action was executed." );

      state.setIn( ['test', 'A'], true );
    });
  });
});

test( "Actions", sub => {
  sub.test( "...should not be executed immediately.", assert => {
    const engine = Engine();
    let flag = false;

    engine.dispatch( state => {
      flag = true;

      assert.pass( "The action should be executed." );
      assert.end();
    });

    assert.equal( flag, false, "The action should be executed after the dispatching thread completes.")
  });
});
