import test from 'tape';

import Rx, { Observable, Subject } from 'rx-lite';
import RxExtras from 'rx-lite-extras';

test( "rxjs...", sub => {
  sub.test( "...should support the observeOn method via the lite distribution.", assert => {
    assert.plan( 2 );

    //const source = new Subject();
    const source = Observable.create( observer => {
      observer.onNext( 1 );
      observer.onCompleted();
    });
    assert.ok( source, "A subject should have been instantiated." );
    assert.equal( typeof source.observeOn, 'function', "The subject should have an observeOn method." );

    assert.end();
  });
});
