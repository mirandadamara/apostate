import now from './now';

let last = now();

export default function() {
	const time = now();
	const span = time - last;

	last = time;

	return span;
}