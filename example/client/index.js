import Apostate from '../../lib';

const engine = Apostate();

engine.express( function( state ) {
	console.log( state.toJS() );
});