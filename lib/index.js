export default function() {
	const signalHelpers = {};
	const behaviors = {};

	return {
		signal( name, actions = [] ) {
			behaviors[name] = actions;

			return signalHelpers[name] = function() {
				console.log( "SIGNAL:", name );
			};
		}
	};
};