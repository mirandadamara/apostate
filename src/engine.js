import Rx from 'rx/dist/rx.all';
import Immutable from 'immutable';

const defaultOptions = {
  initialState: {},
  warnings: true
};

export default function( options = {} ) {
  options = Object.assign({}, defaultOptions, options );

  const { initialState } = options;

  const _actions = {};  // A dictionary of actions in the form name:function.

  const _queue = new Rx.Subject();
  const _state = _queue
    .observeOn( Rx.Scheduler.default )
    .scan( ( state, action ) => execute( action, state ), Immutable.fromJS( initialState ) )
    .publish();

  _state.connect();

  function execute( action, state ) {
    return state.withMutations( s => action.fn.call({}, s, action.params ) );
  }

  /**
   * Register an action by name.
   *
   * @param  {String}   name   The name of the action, to be used for subsequent calls to `dispatch`.
   * @param  {Function} action The action. A function with signature `( state, params ) => {}` where `state`
   *                           is a mutable state object.
   */
  function register( name, action ) {
    _actions[name] = action;
  }

  function dispatch( name, params ) {
    // Handle anonymous actions...
    if ( typeof name == 'function' ) {
      _queue.onNext({ fn: name });
    }
    // ...and registered actions.
    else {
      const action = _actions[name];

      if ( !action ) {
        if ( options.warnings ) console.warn( `[apostate] No registered action for ${ name }.` );
      }
      else {
        _queue.onNext({ fn: action, params });
      }
    }
  }

  function state( ...observer ) {
    return _state.subscribe( ...observer );
  }

  return {
    register,
    dispatch,
    state
  };
}
