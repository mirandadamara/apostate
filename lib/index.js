import Rx from 'rx/dist/rx.all';

import chain from './chain';

export default function( initializer = {} ) {
	const signalHelpers = {};
	const behaviors = {};

	const signals = new Rx.Subject();
	const updates = new Rx.BehaviorSubject( initializer );

	// React to signals.
	signals.subscribe( function( signal ) {
		console.log( "SIGNAL:", signal );

		let actions = Rx.Observable.fromArray( behaviors[signal.name] || [] ).map( wrap );

		chain( signal, actions ).publish().connect();	// Without publishing, actions would not be executed (since there is no observer).
	});

	function wrap( action ) {
		return function( input ) {
			return Rx.Observable.create( function( observer ) {
				updates
					.take( 1 )
					.map( state => action({ state, input }) )
					.concatMap( value => value )
					.subscribe( observer );
			});
		}
	}

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