import Rx from 'rx/dist/rx.all';

import { request, cancel } from './frame-polyfill';

export default function () {
	return Rx.Observable.create( function( observer ) {
		let id;

		function next() {
			observer.onNext( ( new Date() ).getTime() );

			id = request( next );
		}

		id = request( next );

		return function() {
			cancel( id );
		};
	});
};