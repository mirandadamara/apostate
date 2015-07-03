import Rx from 'rx/dist/rx.all';
import Immutable from 'immutable';

import chain from './chain';

import Frames from './animation/frames';

export default function( initializer = {} ) {
	const signalHelpers = {};
	const behaviors = {};

	const signals = new Rx.Subject();
	const updates = new Rx.BehaviorSubject( Immutable.Map( initializer ) );

	const frames = Frames()
		.concatMap( () => updates.take( 1 ) )
		.distinctUntilChanged();

	// React to signals.
	signals.subscribe( function( signal ) {
		console.log( "SIGNAL:", signal );

		let actions = Rx.Observable.fromArray( behaviors[signal.name] || [] );

		chain( signal, actions.map( wrap ) ).publish().connect();	// Without publishing, actions would not be executed (since there is no observer).
	});

	/**
	 * Wrap an action to inject current state.
	 *
	 * @param action
	 * @returns {Function}
	 */
	function wrap( action ) {
		return function( input ) {
			return Rx.Observable.create( function( observer ) {
				updates
					.take( 1 )
					.map( state => mutate( state, action, input ) )
					.concatMap( value => value )
					.subscribe( observer );
			});
		}
	}

	/**
	 *
	 * @param state {Immutable} Immutable object representing current state.
	 * @param action {Function} A function that will mutate state.
	 * @param input {{}} Parameters to pass to the action.
	 *
	 * @returns {*} The output of `action`, to be passed to subsequent actions in the chain.
	 */
	function mutate( state, action, input ) {
		let result;
		let update = state.withMutations( function( s ) {
			result = action({ state: s, input });

			return s;
		});

		if ( state !== update ) {
			updates.onNext( update );
		}

		return result;
	}

	function dispatch( signal ) {
		console.log( "DISPATCH:", signal );
		signals.onNext( signal );
	}

	// Log state mutations.
	updates.subscribe( function( state ) {
		console.log( "UPDATE:", state.toJS() );
	});

	return {
		signal( name, actions = [] ) {
			console.log( "REGISTER:", name );

			behaviors[name] = actions;

			return signalHelpers[name] = function( params = {} ) {
				dispatch({ name, params });
			};
		},

		/**
		 * Register a handler to render the application. This handler will be called each animation frame that occurs
		 * with an updates state.
		 *
		 * @param handler {Function} Signature: `( state ) => {}`
		 */
		express( handler ) {
			return frames.subscribe( handler );
		}
	};
};