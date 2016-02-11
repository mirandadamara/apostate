## Experimental
Apostate is an experiment in reactive application-state management.


## Routing

Apostate exposes express-style routing, via adapters. Each route has one or more handler, with a signature `function( req, res, next ) { ... }`. Several Apostate-specific methods are exposed via the `req` and `res` objects.


```JS
const router = Router({ adapter });

router.get( '/', ( req, res ) => {
  const tasks = [
    { label: 'Clean the gutters.', completed: false },
    { label: 'Pickup milk', completed: false }
  ];

  res.dispatch( state => {
    state.set( 'tasks', Immutable.fromJS( tasks ) );

    res.completed()
  });
});
```

### Anonymous Actions
```JS
res.dispatch( state => {
  state.set( 'status', 'completed' );
});
```

### Named Actions
```JS
engine.register( 'status:update', ( state, params ) => {
  state.set( 'status', params.status );
});

res.dispatch( 'status:update', { status: 'completed' });
```

## Express (Server)

```JS
import Immutable from 'immutable';
import { Observable } from 'rx/dist/rx.all';

import express from 'express';

import Engine from 'apostate/engine';
import Router from 'apostate/router';
import ExpressAdapter from 'apostate/adapters/express';

const app = express();

function initialize( req ) {
  const state = Immutable.fromJS({
    // ...
  });

  return Observable.return( state );
}

function render( state ) {
  const content		= React.renderToString( React.createElement( App, { state } ) );
	const document	= React.renderToStaticMarkup( React.createElement( Document, { content, state }) );

	const status = state.get( 'status', 200 );

	return { status, document };
}

const actions = {
  'feed:load': function( state, { done }) {
    done();
  }
}

const router = Router({ adapter: ExpressAdapter({ app, Engine, initialize, render, config: { actions } }) });

router.get( '/', ( req, res ) => {
  const { dispatch } = res;

  const href = ( typeof location != 'undefined' ) ? location.href : '/';
  const network = req.state.getIn( ['session', 'user'] ) ? 'personal' : 'featured';

  dispatch( state => {
    state.delete( 'overlay' );
    state.set( 'page', Immutable.fromJS({ base: 'home', title: "Home | This.", filters: { network } }) );

    res.completed()
  });

  dispatch( 'feed:load', { network, done: res.completed });
});
```
