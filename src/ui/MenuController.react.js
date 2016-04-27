import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import {connect} from 'react-redux';

const MenuController = ({
	menuVisible, toggleMenu, visibleWhenClosed, visibleWhenOpen
}) => {
	visibleWhenOpen = visibleWhenOpen === undefined ? true : visibleWhenOpen;
	visibleWhenClosed = visibleWhenClosed === undefined ? true : visibleWhenClosed;

	if (menuVisible && visibleWhenOpen || !menuVisible && visibleWhenClosed) {
		return (
			<div className="menu_controller">
				<Glyphicon glyph="menu-hamburger" bsSize="large" onClick={toggleMenu} />
			</div>
		);
	} else {
		return false;
	}
};

const mapStateToProps = state => {
	return {
		menuVisible: state.ui.menuVisible
	};
};
const mapDispatchToProps = dispatch => {
	return {
		toggleMenu: () => {
			dispatch({
				type: 'UI_MENU_TOGGLE'
			});
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(MenuController);
