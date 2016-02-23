import page from 'page';
import map from 'lodash/map';

const defaultOptions = {};

export default function( options = {} ) {
  options = Object.assign({}, defaultOptions, options );

  const { adapter } = options;

  return {
    get( path, ...handlers ) {
      handlers = map( handlers, handler => adapter.adapt( handler ) );

      adapter.route( path, handlers );
    },

    navigate( url ) {
      return adapter.navigate( url );
    }
  };
}
