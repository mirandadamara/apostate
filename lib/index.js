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

	// State
	const { cacheState, fetchState } = (function() {
		let cachedState = Immutable.fromJS( defaults( initializer, defaultState ) );

		return {
			cacheState( state, source = "UNKNOWN" ) {
				if ( cachedState != state ) {
					//console.log( "UPDATE STATE:", state, source );

					cachedState = state;
				}

				return cachedState;
			},

			fetchState() {
				return cachedState;
			}
		};
	})();

	/**
	 * Wrap an action to inject current state and cache mutated state.
	 *
	 * @param action {Function} Accepts a function with signature `( input, mutableState ) => ( output )`.
	 * @returns {Function} Returns a function with signature `( input ) => ( output )`.
	 */
	function wrap( action ) {
		const name = ( action.displayName || action.name || 'action' );

		let fn = function wrappedAction( input ) {
			let output;

			const state = fetchState().withMutations( function( state ) {
				output = action( state, input, { animate: animationHelper( state ), dispatch: queue });

				return state;
			});

			cacheState( state, `ACTION (${ name })` );

			if ( typeof output != 'object' || typeof output.subscribe != 'function' ) {
				output = Rx.Observable.return( output );
			}

			return output;
		};

		fn.displayName = name + 'Wrapper';

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

		//console.log( "QUEUE:", signal.name, signal );

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
	 * @returns
	 */
	function animate( time ) {
		const state = fetchState().withMutations( function( s ) {
			s.update( '$animations', function( $animations ) {
				return $animations.filter( function( animation, path ) {
					const { progress, values } = animation( time );

					if ( !s.hasIn( path ) ) {
						console.log( "MISSING PATH:", path, s.toJS() );
						return false;
					}

					s.updateIn( path, target => target.mergeDeep( values ) );

					return ( progress < 1 );
				});
			});

			return s;
		});

		cacheState( state, "ANIMATE" );

		return state;
	}

	function animationHelper( mutableState ) {
		return function( path, animator ) {
			mutableState.update( '$animations', animations => {
				return animations.set( path, animator );
			});
		}
	}

	return {
		/**
		 * Create a pathway for processing a named signal, via a sequence of actions.
		 *
		 * @param name {String} Signal name.
		 * @param actions {Array} An array of actions that will be applied in sequence.  Actions must have a signature `({ input, mutableState }) => (observableOutput)`.
		 */
		signal( name, actions = [] ) {
			// Actions will be wrapped to facilitate asynchronous injection of the current state, as well as
			// mutation of the state.
			actions = Rx.Observable.fromArray( actions ).map( wrap );

			const channel = signals
				.filter( signal => ( signal.name == name ) )
				//.tap( () => console.log( "SIGNAL:", name ) )
				.map( signal => signal.params )
				.chain( actions )
				.tapOnError( err => console.error( "PROCESSING ERROR:", err ) );

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
		 * @param actions
		 * @param handler {Function} Signature: `( state ) => {}`
		 */
		express( handler, actions = [] ) {
			actions = Rx.Observable.fromArray( actions ).map( wrap );

			return signals
				.filter( signal => ( signal.name == '$express$' ) )
				.map( signal => signal.params.timestamp )
				.map( animate )
				.distinctUntilChanged()
				//.tap( () => console.log( "EXPRESS" ) )
				.chain( actions )
				.map( () => fetchState() )
				//.tap( state => console.log( "FRAME:", state.toJS() ) )
				.subscribe( handler );
		},

		signals: signalHelpers
	};
};