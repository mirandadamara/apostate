import Apostate from '../lib';

function action( state, input, signal ) {
	console.log( "Action:", signal.name || '' );

	return input;
}

const engine = Apostate();

engine.signal( 'sigA', [action] );
engine.signal( 'sigB', [action] );

engine.signals.sigA();
engine.signals.sigB();