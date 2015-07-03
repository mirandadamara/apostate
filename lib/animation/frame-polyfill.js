// Adapted from:
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license

const vendors = ['ms', 'moz', 'webkit', 'o'];

let x;
let lastTime = 0;

let request = window.requestAnimationFrame;
let cancel	= window.cancelAnimationFrame;

for ( x = 0; x < vendors.length && !request; ++x ) {
	request = window[vendors[x]+'RequestAnimationFrame'];
	cancel 	= window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
}

if ( !request ) {
	request = function( callback, element ) {
		let currTime = new Date().getTime();
		let timeToCall = Math.max(0, 16 - (currTime - lastTime));
		let id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );

		lastTime = currTime + timeToCall;

		return id;
	};
}

if ( !cancel ) {
	cancel = function( id ) {
		clearTimeout( id );
	};
}

export { request, cancel };