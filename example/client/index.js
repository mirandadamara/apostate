import Rx from 'rx/dist/rx.all';

import { pick, echo } from './actions/util';
import { f1, f2, f3 } from './actions/process';
import increment from './actions/increment';

import cortex from './cortex';

cortex.express( function( state ) {
	console.log( "FRAME:", state.toJS() );
});

const sig1 = cortex.signal( 'sig1', [pick( 'params' ), f1, f2, echo] );
const sig2 = cortex.signal( 'sig2', [pick( 'params' ), increment, f1, increment, f2, f3, echo ] );

console.log( "Client!" );

sig1( 0 );
sig1( 10 );
sig2( 0 );