import now from './now';

export default function( label, callback ) {
	return function() {
		const start = now();

		const result = callback.apply( arguments );
		console.log( label, now() - start );

		return result;
	}
}