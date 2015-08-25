export function swing( progress ) {
	return .5 - Math.cos( progress * Math.PI )/2;
}