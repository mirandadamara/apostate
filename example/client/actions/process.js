import Rx from 'rx/dist/rx.all';

export function f1({ state, input }) {
	return Rx.Observable.create( function( observer ) {
		setTimeout( function() {
			observer.onNext( ( 10 * input ) + 1 );
			observer.onCompleted();
		}, 5000 );
	});
}

export function f2({ state, input }) {
	return Rx.Observable.return( ( 10 * input ) + 2 );
}

export function f3({ state, input }) {
	return Rx.Observable.return( ( 10 * input ) + 3 );
}