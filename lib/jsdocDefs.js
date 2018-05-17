module.exports = exports = {
	JSDOC_CLASS: (`/**
		* @todo Write Class Description
		* @extends React.Component
		* @class
		*/`).replace(/^		/gm, ''),

	JSDOC_CONSTRUCTOR: (`/**
		 * @constructor
		 * @param {object} props - This components props.
		 */`).replace(/^	/gm, ''),

	JSDOC_RENDER: (`/**
		 * Renders the CLASSNAME component.
		 * @return {React.Component}
		 */`).replace(/^	/gm, ''),

	JSDOC_COMPONENTDIDMOUNT: (`/**
		 * Invoked immediately after a component is mounted. Initialization
		 * that requires DOM nodes should go here. If you need to load data
		 * from a remote endpoint, this is a good place to instantiate the
		 * network request.
		 */`).replace(/^	/gm, ''),

	JSDOC_SHOULDCOMPONENTUPDATE: (`/**
		 * Invoked before rendering when new props or state are being
		 * received. Defaults to true. This method is not called for the
		 * initial render or when forceUpdate() is used.
		 * @param {object} nextProps - The props that will become the props
		 * after the component update cycle completes.
		 * @param {object} nextState - The state that will become the
		 * component state after the update cycle completes.
		 * @return {boolean} Whether or not the component should re-render.
		 */`).replace(/^	/gm, ''),

	JSDOC_COMPONENTDIDUPDATE: (`/**
		 * Invoked immediately after updating occurs. This method is not
		 * called for the initial render.
		 * @param {object} prevProps - The props object as it was before
		 * the update.
		 * @param {object} prevState - The state object as it was before
		 * the update.
		 * @param {any} snapshot - The snapshot returned by the
		 * Component.getSnapshotBeforeUpdate function.
		 */`).replace(/^	/gm, ''),

	JSDOC_COMPONENTWILLUNMOUNT: (`/**
		 * Invoked immediately before a component is unmounted and destroyed.
		 * Perform any necessary cleanup in this method, such as invalidating
		 * timers, canceling network requests, or cleaning up any subscriptions
		 * that were created in componentDidMount().
		 */`).replace(/^	/gm, ''),

	JSDOC_COMPONENTDIDCATCH: (`/**
		 * Invoked when an error ocurrs anywhere in the component tree below
		 * this component. Can be used for cleanup and/or for displaying a
		 * fallback UI instead of the crashed component tree.
		 * @param {any} error - The error that caused the crash.
		 * @param {object} info - An object with information about the error.
		 */`).replace(/^	/gm, ''),

	JSDOC_GETSNAPSHOTBEFOREUPDATE: (`/**
		 * Invoked right before the most recently rendered output is committed
		 * to e.g. the DOM. It enables your component to capture current values
		 * (e.g. scroll position) before they are potentially changed. Any value
		 * returned by this lifecycle will be passed as a parameter to
		 * componentDidUpdate().
		 * @param {object} prevProps - The props object as it was before
		 * the update.
		 * @param {object} prevState - The state object as it was before
		 * the update.
		 * @return {any} The snapshot to be passed to componentDidUpdate().
		 */`).replace(/^	/gm, ''),

	JSDOC_GETDERIVEDSTATEFROMPROPS: (`/**
		 * Invoked after a component is instantiated as well as when it receives
		 * new props. It should return an object to update state, or null to
		 * indicate that the new props do not require any state updates.
		 * @param {object} nextProps - The props that will become the props
		 * after the component update cycle completes.
		 * @param {object} prevState - The state object as it was before
		 * the update.
		 * @return {object} An object to update state, or null to indicate that
		 * the new props do not require any state updates.
		 */`).replace(/^	/gm, ''),

	JSDOC_STATELESS: (`/**
		 * Returns the stateless CLASSNAME components.
		 * @return {React.Component}
		 */`).replace(/^		/gm, ''),
};
