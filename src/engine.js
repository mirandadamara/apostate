import Rx from 'rx/dist/rx.all';
import Immutable from 'immutable';

const defaultOptions = {
  initialState: {}
};

export default function( options = {} ) {
  options = Object.assign({}, defaultOptions, options );

  const { initialState } = options;

  const _queue = new Rx.Subject();
  const _state = _queue
    .observeOn( Rx.Scheduler.default )
    .scan( ( state, action ) => execute( action, state ), Immutable.fromJS( initialState ) )
    .publish();

  _state.connect();

  function execute( action, state ) {
    return state.withMutations( s => action( s ) );
  }

  return {
    dispatch( action ) {
      _queue.onNext( action );
    },

    state( ...observer ) {
      return _state.subscribe( ...observer );
    }
  };
}
