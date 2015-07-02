import Rx from 'rx/dist/rx.all';

import chain from './chain';

export default function() {
	const signalHelpers = {};
	const behaviors = {};

	const signals = new Rx.Subject();

	// React to signals.
	signals.subscribe( function( signal ) {
		console.log( "SIGNAL:", signal );

		let actions = behaviors[signal.name] || [];

		chain( signal, actions ).publish().connect();	// Without publishing, actions would not be executed (since there is no observer).
	});

	function dispatch( signal ) {
		console.log( "DISPATCH:", signal );
		signals.onNext( signal );
	}

	return {
		signal( name, actions = [] ) {
			console.log( "REGISTER:", name );

			behaviors[name] = actions;

			return signalHelpers[name] = function( params = {} ) {
				dispatch({ name, params });
			};
		}
	};
};