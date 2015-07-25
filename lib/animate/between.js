import each from 'lodash/collection/each';

function now() {
	return ( new Date() ).getTime();
}

/**
 *
 * @param start
 * @param end
 * @param duration
 * @returns {Function}
 */
export default function between( start, end, duration = 0 ) {
	const startTime = now();

	console.log( "BETWEEN:", start, end, duration );

	return function( time ) {
		const progress = ( duration <= 0 ) ? 1 : Math.min( 1, ( time - startTime ) / duration );
		let values = {};

		each( end, function( value, key ) {
			values[key] = start[key] + progress * ( end[key] - start[key] );
		});

		console.log( "BETWEEN FRAME:", time, { progress, values });

		return { progress, values };
	}
}