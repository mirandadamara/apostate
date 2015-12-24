import test from 'tape';

import Engine from '../../engine';

test( "An engine", sub => {
  sub.test( "...should accept a dictionary of actions on instantiation.", assert => {
    assert.timeoutAfter( 1000 );
    
    const actions = {
      'test:action-a': function( state, params ) {
        assert.end();
      }
    };

    const engine = Engine({ actions });
    engine.dispatch( 'test:action-a' );
  });
});

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

  sub.test( "...should accept registered actions by name.", assert => {
    assert.timeoutAfter( 1000 );

    const engine = Engine();

    assert.equal( typeof engine.register, 'function', "An engine should expose a 'register' method." );

    engine.register( 'toggle', ( state, params ) => {
      assert.deepEqual( params, { flag: 'test-a', value: true }, "Dispatched parameters should be passed to the action." );
      assert.end();
    });

    engine.dispatch( 'toggle', { flag: 'test-a', value: true });
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

test( "Errors", sub => {
  sub.test( "...thrown in actions should be captured and reported.", assert => {
    assert.plan( 1 );

    const engine = Engine();

    engine.state(
      state => {},
      error => {
        assert.pass( "An error should be caught." );
        assert.end();
      }
    );

    engine.dispatch( state => {
      throw new Error( "Apostate test error." );
    });
  });
});
