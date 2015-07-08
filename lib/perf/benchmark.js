
function repeat( test, iterations = 1000 ) {
	let results = [];

	for ( let i = 0; i < iterations; i++ ) {
		results.push( test() );
	}

	return results;
}

function summarize( results ) {
	const { sum, count } = reduce( results, ( acc, x ) => ({ count: acc.count + 1, sum: acc.sum + x }), { count: 0, sum: 0 });

	return {
		average: ( sum / count ),
		N: count
	}
}