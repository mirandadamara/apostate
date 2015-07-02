// https://gist.github.com/zebulonj/c9468379ef40221160c6
import Rx from 'rx/dist/rx.all';

/**
 * Filters accept an input, and return an observable that will yield a single value (the filtered input).
 *
 * @param x
 * @returns {Observable<T>}
 */

/**
 *
 *
 * @param input {} A value to be processed by a chain of filters.
 * @param filters {Observable} A sequence of filters through which to process the input.
 * @returns {Observable} The output after processing `input` through the chained filters.
 */
export default function chain( input, filters ) {
	return filters.reduce( ( chain, filter ) => chain.concatMap( filter ), Rx.Observable.return( input ) ).concatMap( value => value );
}