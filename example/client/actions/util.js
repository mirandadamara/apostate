import Rx from 'rx/dist/rx.all';

export function pick( key ) {
	return function( obj ) {
		return Rx.Observable.return( obj[key] );
	};
}

export function echo( value ) {
	console.log( "ECHO:", value );

	return Rx.Observable.return( value );
}