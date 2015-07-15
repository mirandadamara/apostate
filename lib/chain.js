// https://gist.github.com/zebulonj/c9468379ef40221160c6

/**
 * Filters accept an input, and return an observable that will yield a single value (the filtered input).
 *
 * @param value {{}}
 * @returns {Observable<T>}
 */

/**
 *
 *
 * @param input {Observable} A value to be processed by a chain of filters.
 * @param filters {Observable} A sequence of filters through which to process the input.
 * @returns {Observable} The output after processing `input` through the chained filters.
 */
export function chain( input, filters ) {
	return filters.reduce( ( acc, filter ) => acc.concatMap( filter ), input ).concatMap( value => value );
}

export function chainOperator( filters ) {
	return chain( this, filters );
}

export default chain;