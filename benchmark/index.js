import Apostate from '../lib';

import now from '../lib/perf/now';

const timeA = now();
const timeB = now();
console.log( "RESOLUTION:", timeB - timeA );

function action( state, input, signal ) {
	return input;
}

const engine = Apostate();

engine.signal( 'sigA', [action, action, action, action, action, action, action, action, action, action, action, action] );
engine.signal( 'sigB', [action] );
engine.signal( 'sigC' );

engine.signals.sigA();
engine.signals.sigA();
engine.signals.sigA();
engine.signals.sigA();

engine.signals.sigA();
engine.signals.sigB();
engine.signals.sigC();
engine.signals.sigA();
engine.signals.sigB();
engine.signals.sigC();