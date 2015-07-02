import Rx from 'rx/dist/rx.all';

export default function({ state, input }) {
	state.set( 'counter', state.get( 'counter' ) + 1 );

	return Rx.Observable.return( input );
}