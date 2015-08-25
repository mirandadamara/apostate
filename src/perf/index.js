import reduce from 'lodash/collection/reduce';
import values from 'lodash/object/values';

export default function( now ) {
	let stack = [];
	let current = false;
	let interval;

	let times = {};

	function reset() {
		stack = [];
		current = false;

		times = {};
	}

	return {
		start( label = 'global' ) {
			reset();

			current = label;
			return interval = now();
		},

		push( label = 'sub' ) {
			const time = now();

			times[current] = ( times[current] || 0 ) + ( time - interval );

			stack.push( current );
			current = label;

			return interval = now();
		},

		pop() {
			const time = now();

			times[current] = ( times[current] || 0 ) + ( time - interval );
			current = stack.pop();

			return interval = now();
		},

		end() {
			const time = now();

			times[current] = ( times[current] || 0 ) + ( time - interval );
			current = stack.pop();

			times['TOTAL'] = reduce( values( times ), ( acc, val ) => acc + val, 0 );

			return interval = now();
		},

		report() {
			return times;
		},

		reset
	};
}