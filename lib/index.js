import Rx from 'rx/dist/rx.all';
import Immutable from 'immutable';

import each from 'lodash/collection/each';
import defaults from 'lodash/object/defaults';

import { chainOperator, chain } from './chain';
Rx.Observable.prototype.chain = chainOperator;

import frames from './animation/frames';

import now from './perf/now';

const defaultState = {
	$animations: {}
};

const defaultOptions = {
	debug: false
};

export default function( initializer = {}, options = {} ) {
	options = defaults( options, defaultOptions );

	const signalHelpers = {};

	/**
	 * A collection of subscription disposal functions associated with signal processing channels.
	 */
	const channels = {};

	const dispatcher = new Rx.Subject();
	const updates = new Rx.BehaviorSubject( Immutable.fromJS( initializer ) );

	const signals = Rx.Observable.merge( frames().map( timestamp => ({ name: '$express$', params: { timestamp } }) ), dispatcher.observeOn( Rx.Scheduler.default ) );

	let cachedState = Immutable.fromJS( defaults( initializer, defaultState ) );

	/**
	 * Wrap an action to inject current state and cache mutated state.
	 *
	 * @param action {Function} Accepts a function with signature `({ input, mutableState }) => ( output )`.
	 * @returns {Function} Returns a function with signature `( input ) => ( output )`.
	 */
	function wrap( action ) {
		let fn = function wrappedAction( input ) {
			let output;

			cachedState = cachedState.withMutations( function( state ) {
				output = action( state, input );

				return state;
			});

			if ( typeof output != 'object' || typeof output.subscribe != 'function' ) {
				output = Rx.Observable.return( output );
			}

			return output;
		};

		fn.displayName = ( action.displayName || action.name || 'action' ) + 'Wrapper';

		return fn;
	}

	/**
	 * Queues signals for scheduled dispatch.
	 * 
	 * @param signal
	 * @returns {*}
	 */
	function queue( signal ) {
		signal.id = id( 'S-' );
		signal.time = now();

		console.log( "QUEUE:", signal.name, signal );

		dispatcher.onNext( signal );

		return signal;
	}

	let counter = 0;

	function id( prefix = '' ) {
		return ( prefix + counter++ );
	}

	/**
	 * Calls each animation (recording immediate updates against state); then trims completed animations.
	 *
	 * @param time
	 * @param state
	 * @returns {Observable<T>}
	 */
	function animate({ input, signal, state }) {
		return state.withMutations( function( s ) {
			s.update( '$animations', function( $animations ) {
				return $animations.filter( function( animation ) {
					const { progress } = animation( input.timestamp, s );

					return ( progress < 1 );
				});
			});

			return s;
		});
	}

	return {
		/**
		 * Create a pathway for processing a named signal, via a sequence of actions.
		 *
		 * @param name {String} Signal name.
		 * @param actions {Array} An array of actions that will be applied in sequence.  Actions must have a signature `({ input, mutableState }) => (observableOutput)`.
		 */
		signal( name, actions = [] ) {
			console.log( "REGISTER:", name );

			// Actions will be wrapped to facilitate asynchronous injection of the current state, as well as
			// mutatio of the state.
			actions = Rx.Observable.fromArray( actions ).map( wrap );

			const channel = signals
				.filter( signal => ( signal.name == name ) )
				.map( signal => signal.params )
				.chain( actions );

			const source = channel.publish();
			const connection = source.connect();

			channels[name] = { source, connection };

			return signalHelpers[name] = function( params = {} ) {
				queue({ name, params });
			};
		},

		/**
		 * Register a handler to render the application. This handler will be called each animation frame that occurs
		 * with an updates state.
		 *
		 * @param sync {Function} Synchronous function to sync state before expression (TEMPORARY).
		 * @param handler {Function} Signature: `( state ) => {}`
		 */
		express( sync, handler ) {
			if ( typeof handler == 'undefined' ) {
				handler = sync;
				sync = state => state;
			}

			return signals
				.filter( signal => ( signal.name == '$express$' ) )
				.map( signal => ({ input: signal.params, state: cachedState }) )
				.map( animate )
				.map( sync )
				.distinctUntilChanged()
				.tap( state => console.log( "FRAME:", state.toJS() ) )
				.subscribe( handler );
		},

		signals: signalHelpers
	};
};