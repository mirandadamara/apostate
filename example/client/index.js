import Rx from 'rx/dist/rx.all';

import cortex from './cortex';

function f1( x ) {
	return Rx.Observable.create( function( observer ) {
		setTimeout( function() {
			observer.onNext( ( 10 * x ) + 1 );
			observer.onCompleted();
		}, 5000 );
	});
}

function f2( x ) {
	return Rx.Observable.return( ( 10 * x ) + 2 );
}

function f3( x ) {
	return Rx.Observable.return( ( 10 * x ) + 3 );
}

function pick( key ) {
	return function( obj ) {
		return Rx.Observable.return( obj[key] );
	};
}

function echo( value ) {
	console.log( "ECHO:", value );

	return Rx.Observable.return( value );
}

const sig1 = cortex.signal( 'sig1', [pick( 'params' ), f1, f2, echo] );
const sig2 = cortex.signal( 'sig2', [pick( 'params' ), f1, f2, f3, echo ] );

console.log( "Client!" );

sig1( 0 );
sig1( 10 );
sig2( 0 );