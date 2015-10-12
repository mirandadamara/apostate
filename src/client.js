import Rx from 'rx/dist/rx.all';
import Immutable from 'immutable';

import assign from 'lodash/object/assign';
import mapValues from 'lodash/object/mapValues';
import each from 'lodash/collection/each';
import defaults from 'lodash/object/defaults';

import { chainOperator, chain } from './chain';
Rx.Observable.prototype.chain = chainOperator;

import frames from './animation/frames';

function now() {
	return ( new Date() ).getTime();
}

const defaultState = {
	$animations: {}
};

const defaultOptions = {
	debug: false,
	animate: false
};

export default function( initializer = {}, options = {} ) {
	options = defaults( options, defaultOptions );

	const { router } = options;

	const signalHelpers = {};
	const utilities = {
		dispatch: queue
	};

	/**
	 * A collection of subscription disposal functions associated with signal processing channels.
	 */
	const channels = {};

	const queueCurrent = new Rx.Subject();
	const queueBackground = new Rx.Subject();

	const updates = new Rx.BehaviorSubject( Immutable.fromJS( initializer ) );

	const signals = Rx.Observable.merge( ( options.animate ? frames().map( timestamp => ({ name: '$express$', params: { timestamp } }) ) : Rx.Observable.empty() ), queueCurrent.observeOn( Rx.Scheduler.currentThread ), queueBackground.observeOn( Rx.Scheduler.default ) );

	const frames = new Rx.Subject();

	// State
	const { cacheState, fetchState } = (function() {
		let cachedState = Immutable.fromJS( defaults( initializer, defaultState ) );

		return {
			cacheState( state, source = "UNKNOWN" ) {
				if ( cachedState !== state ) {
					frames.onNext( cachedState = state );
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
				output = action( state, input, utilities );

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

	const queues = {
		current:	queueCurrent,
		background:	queueBackground
	};

	/**
	 * Queues signals for scheduled dispatch.
	 *
	 * @param signal
	 * @returns {*}
	 */
	function queue( signal, priority = 'current' ) {
		signal.id = id( 'S-' );
		signal.time = now();

		queues[priority] && ( queues[priority].onNext( signal ) );	// TODO: Catch invalid priority.

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
		inject( factories ) {
			assign( utilities, mapValues( factories, factory => factory({}) ) );
		},

		/**
		 * Create a pathway for processing a named signal, via a sequence of actions.
		 *
		 * @param name {String} Signal name.
		 * @param actions {Array} An array of actions that will be applied in sequence.  Actions must have a signature `({ input, mutableState }) => (observableOutput)`.
		 */
		signal( name, actions = [], priority = 'current' ) {
			// Actions will be wrapped to facilitate asynchronous injection of the current state, as well as
			// mutation of the state.
			actions = Rx.Observable.fromArray( actions ).map( wrap );

			const channel = signals
				.filter( signal => ( signal.name == name ) )
				.map( signal => signal.params )
				.chain( actions )
				.tapOnError( err => console.error( err ) );

			const source = channel.publish();
			const connection = source.connect();

			channels[name] = { source, connection };

			return signalHelpers[name] = function( params = {} ) {
				queue({ name, params }, priority );
			};
		},

		route( routes ) {
			routes( ( path, actions ) => router( path, this.signal( 'route:' + path, actions ) ) );
		},

		/**
		 * Register a handler to render the application. This handler will be called each animation frame that occurs
		 * with an updates state.
		 *
		 * @param actions
		 * @param handler {Function} Signature: `( state ) => {}`
		 */
		mount( handler ) {
			// Subscribe before mounting to catch initial `componentDidMount` signals.
			const subscription = frames.subscribe( ( state ) => handler( state, signalHelpers ) );

			// Initial mounting...
			handler( fetchState(), signalHelpers );

			return subscription;
		},

		signals: signalHelpers
	};
};
