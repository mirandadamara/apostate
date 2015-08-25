import each from 'lodash/collection/each';

import { swing } from './easing';

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
export default function between( start, end, duration = 0, easing = swing ) {
	const startTime = now();

	return function( time ) {
		const progress = easing( ( duration <= 0 ) ? 1 : Math.min( 1, ( time - startTime ) / duration ) );
		let values = {};

		each( end, function( value, key ) {
			values[key] = start[key] + progress * ( end[key] - start[key] );
		});

		return { progress, values };
	}
}