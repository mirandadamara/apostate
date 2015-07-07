import Apostate from '../lib';

function action( state, input, signal ) {
	return input;
}

const engine = Apostate();

engine.signal( 'sigA', [action, action] );
engine.signal( 'sigB', [action] );

engine.signals.sigA();
engine.signals.sigB();