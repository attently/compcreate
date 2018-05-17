import {Component} from 'react';
STATELESS

JSDOC_CLASS
class CLASSNAME extends Component {
	JSDOC_CONSTRUCTOR
	constructor(props) {
		super(props);

		this.state = {};
	}

	JSDOC_RENDER
	render() {
		return (
			RETURNCONTENTS
		);
	}

	JSDOC_COMPONENTDIDMOUNT
	componentDidMount() {}

	JSDOC_SHOULDCOMPONENTUPDATE
	shouldComponentUpdate(nextProps, nextState) {
		return true;
	}

	JSDOC_COMPONENTDIDUPDATE
	componentDidUpdate(prevProps, prevState, snapshot) {}

	JSDOC_COMPONENTWILLUNMOUNT
	componentWillUnmount() {}

	JSDOC_COMPONENTDIDCATCH
	componentDidCatch(error, info) {}

	JSDOC_GETSNAPSHOTBEFOREUPDATE
	getSnapshotbeforeUpdate(prevProps, prevState) {
		return null;
	}

	JSDOC_GETDERIVEDSTATEFROMPROPS
	static getDerivedStateFromProps(nextProps, prevState) {
		return null;
	}
}

CLASSNAME.defaultProps = {

};

CLASSNAME.displayName = 'CLASSNAME';

export default CLASSNAME;
