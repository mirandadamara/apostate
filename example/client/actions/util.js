import Rx from 'rx/dist/rx.all';

export function pick( key ) {
	return function( state, input ) {
		return Rx.Observable.return( input[key] );
	};
}

export function echo( state, input ) {
	console.log( "ECHO:", input );

	return Rx.Observable.return( input );
}