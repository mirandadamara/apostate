import Rx from 'rx/dist/rx.all';

export function f1( x ) {
	return Rx.Observable.create( function( observer ) {
		setTimeout( function() {
			observer.onNext( ( 10 * x ) + 1 );
			observer.onCompleted();
		}, 5000 );
	});
}

export function f2( x ) {
	return Rx.Observable.return( ( 10 * x ) + 2 );
}

export function f3( x ) {
	return Rx.Observable.return( ( 10 * x ) + 3 );
}