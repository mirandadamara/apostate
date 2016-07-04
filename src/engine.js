const defaultOptions = {
  initialState: {},
  actions: {},
  scheduling: 'default'
};

export default function( options = {} ) {
  options = Object.assign({}, defaultOptions, options );

  const { Rx, Immutable, initialState } = options;

  if ( process.env.NODE_ENV !== "production" ) {
    if ( !Rx ) throw new Error( "Missing dependency: the apostate engine requires a reference to the RxJS library." ):
    if ( !Immutable ) throw new Error( "Missing dependency: the apostate engine requires a reference to the Immutable library." ): 
  }

  const { Scheduler, Subject } = Rx;

  const schedulers = {
    'default':    Scheduler.default,
    'current':    Scheduler.currentThread,
    'immediate':  Scheduler.immediate
  };

  const _actions = Object.assign({}, options.actions );  // A dictionary of actions in the form name:function.

  const _queue = new Subject();
  const _state = _queue
    .observeOn( schedulers[options.scheduling] || Scheduler.default )
    .scan( ( state, action ) => execute( action, state ), Immutable.fromJS( initialState ) )
    .publish();

  _state.connect();

  const _debugger = new Subject();

  function execute( action, state ) {
    const result = state.withMutations( s => action.fn.call({ dispatch }, s, action.params ) );

    _debugger.onNext({ action: ( action.name ? action.name : "[anonymous]" ), params: action.params, state: result });

    return result;
  }

  if ( process.env.NODE_ENV !== "production" ) {
    _state.subscribe(
      val => console.log( "[apostate]", ( typeof val == 'object' && typeof val.toJS == 'function' ) ? val.toJS() : val )
    );
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
        if ( process.env.NODE_ENV !== "production" ) console.warn( `[apostate] No registered action for ${ name }.` );
      }
      else {
        _queue.onNext({ fn: action, name, params });
      }
    }
  }

  function state( ...observer ) {
    return _state.subscribe( ...observer );
  }

  function debug( ...observer ) {
    return _debugger.subscribe( ...observer );
  }

  return {
    register,
    dispatch,
    state,
    debug
  };
}
