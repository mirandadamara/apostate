import test from 'blue-tape';

import Rx from 'rx/dist/rx.all';

import { chainOperator } from '../lib/chain';
Rx.Observable.prototype.chain = chainOperator;

function f1( value ) {
	return Rx.Observable.return( value * 10 );
}

function f2( value ) {
	return Rx.Observable.return( value + 1 );
}

test( "Rx.Observable should have a '.chain()' method.", ( assert ) => {
	const seq = Rx.Observable.return( 1 );

	assert.equals( 'function', typeof seq.chain );
	assert.end();
});

test( 'Input should be processed by all chained transforms (A)', ( assert ) => new Promise( ( resolve, reject ) => {
	const input = Rx.Observable.return( 1 );
	const transforms = Rx.Observable.fromArray( [f1] );

	const source = input.chain( transforms );

	assert.equals( 'function', typeof source.subscribe );

	let count = 0;

	source.subscribe(
		function( value ) {
			count = count + 1;

			assert.equal( 10, value );
		},
		function( err ) {
			reject( err );
		},
		function() {
			assert.equal( 1, count );

			resolve();
		}
	);
}));

test( 'Input should be processed by all chained transforms (B)', ( assert ) => new Promise( ( resolve, reject ) => {
	const input = Rx.Observable.return( 1 );
	const transforms = Rx.Observable.fromArray( [f1, f2] );

	const source = input.chain( transforms );

	assert.equals( 'function', typeof source.subscribe );

	let count = 0;

	source.subscribe(
		function( value ) {
			count = count + 1;

			assert.equal( 11, value );
		},
		function( err ) {
			reject( err );
		},
		function() {
			assert.equal( 1, count );

			resolve();
		}
	);
}));