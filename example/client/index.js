import cortex from './cortex';

const sig1 = cortex.signal( 'sig1' );
const sig2 = cortex.signal( 'sig2' );

console.log( "Client!" );

sig1();
sig2();