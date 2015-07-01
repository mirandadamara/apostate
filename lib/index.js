import Rx from 'rx/dist/rx.lite';

export default function() {
	const signalHelpers = {};
	const behaviors = {};

	const signalInput = new Rx.Subject();

	signalInput.subscribe( function( signal ) {
		console.log( "SOURCE:", signal );
	});

	function dispatch( signal ) {
		console.log( "DISPATCH:", signal );
		signalInput.onNext( signal );
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