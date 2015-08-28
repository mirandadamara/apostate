import Rx from 'rx/dist/rx.all';
import Immutable from 'immutable';

import map from 'lodash/collection/map';
import defaults from 'lodash/object/defaults';

import { chainOperator, chain } from './chain';
Rx.Observable.prototype.chain = chainOperator;

const defaultState = {};

/**
 * Express.js routing for server-side Apostate.
 *
 * @param  {Router} router Express router.
 *
 * @return {Engine} Returns a server-side Apostate engine.
 */
export default function( router ) {
  const frames = new Rx.Subject();

  /**
   * Prepare an array of actions for mounting.
   */
  function prepare( actions ) {

    return function( req, res, next ) {
      console.log( "ROUTED REQUEST:", req.path );
      let params = { f1: 'A', f2: 'B' };

    	const { cacheState, fetchState } = (function( initializer ) {
    		let cachedState = Immutable.fromJS( defaults( initializer, defaultState ) );

    		return {
    			cacheState( state, source = "UNKNOWN" ) {
    				return ( cachedState = state );
    			},

    			fetchState() {
    				return cachedState;
    			}
    		};
    	})( Immutable.fromJS({ base: 0 }) );
    	/**
    	 * Wrap an action to inject current state and cache mutated state.
    	 *
    	 * @param action {Function} Accepts a function with signature `( params, mutableState ) => ( output )`.
    	 * @returns {Function} Returns a function with signature `( params ) => ( output )`.
    	 */
    	function wrap( action ) {
    		const name = ( action.displayName || action.name || 'action' );

    		let fn = function wrappedAction( params ) {
    			let output;

    			const state = fetchState().withMutations( function( mutableState ) {
    				output = action( mutableState, params );

    				return mutableState;
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


      // action1.concatMap( action2 ).take( 1 )
      Rx.Observable.return( params )
        .chain( Rx.Observable.fromArray( map( actions, wrap ) ) )
        .subscribe(
          () => frames.onNext({ req, res, next, state: fetchState() }),
          ( err ) => next( err )
        );
    };
  }

  return {
    route( routes ) {
      // Mount routes.
      routes( function( path, actions ) {
        console.log( "MOUNT ROUTE:", path );

        router.get( path, prepare( actions ) );
      });
    },

    render( handler ) {
      return frames.subscribe( ( params ) => handler( params ) );
    }
  };
}
