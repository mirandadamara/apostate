import Rx from 'rx/dist/rx.all';
import Immutable from 'immutable';

import each from 'lodash/collection/each';

import chain from './chain';

import Frames from './animation/frames';

function now() {
	return ( new Date() ).getTime();
}

export default function( initializer = {} ) {
	const signalHelpers = {};
	const handlers = {};

	const signals = new Rx.Subject();
	const updates = new Rx.BehaviorSubject( Immutable.fromJS( initializer ) );

	let startFrame;

	const frames = Frames()
		.tap( time => startFrame = time )
		.concatMap( () => updates.take( 1 ), ( time, state ) => ({ time, state }) )
		.concatMap( animate )
		.distinctUntilChanged()
		.map( state => ({ start: startFrame, state }));

	// React to signals.
	signals.subscribe( function( signal ) {
		let actions = Rx.Observable.fromArray( handlers[signal.name] || [] );

		chain( signal.params, actions.map( wrap ) )		// Without observing, actions would not be executed (since there is no observer).
			.subscribe(
				function( val ) {},
				function( err ) {
					console.error( err );
				},
				function() {}
			);
	});

	/**
	 * Calls each animation (recording immediate updates against state and buffering signals); then trims completed
	 * animations; finally, yields signals as a sequence.
	 *
	 * @param time
	 * @param state
	 * @returns {Observable<T>}
	 */
	function animate({ time, state }) {
		let signals = [];

		const update = state.withMutations( function( s ) {
			s.update( '$animations', function( $animations ) {
				return $animations.filter( function( animation ) {
					const { progress, signal } = animation( time, s );

					if ( signal ) {
						signals.push( signal );
					}

					return ( progress < 1 );
				});
			});

			return s;
		});

		if ( update !== state ) {
			updates.onNext( update );
		}

		each( signals, dispatch );

		return updates.take( 1 );
	}

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
			try {
				result = action( s, input );
			}
			catch( err ) {
				result = Rx.Observable.throw( err );
			}

			return s;
		});

		if ( state !== update ) {
			updates.onNext( update );
		}

		if ( typeof result !== 'object' || !( 'subscribe' in result ) ) {
			result = Rx.Observable.return( result );
		}

		return result;
	}

	function dispatch( signal ) {
		console.log( "DISPATCH:", signal.name, signal.params );
		signals.onNext( signal );

		return signal;
	}

	// Log state mutations.
	updates.subscribe( function( state ) {
		console.log( "UPDATE:", state.toJS() );
	});

	return {
		signal( name, actions = [] ) {
			console.log( "REGISTER:", name );

			handlers[name] = actions;

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
		},

		signals: signalHelpers
	};
};