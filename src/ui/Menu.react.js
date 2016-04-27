import React from 'react';
import {connect} from 'react-redux';
import MenuController from './MenuController.react';

const Menu = ({menuVisible, children}) => {
	let classNames = "menu_view";
	if (menuVisible) {
		classNames += " visible";
	}
	return (
		<div>
			<MenuController visibleWhenOpen={false} />
			<div className={classNames}>
				<MenuController visibleWhenClosed={false} />
				{children}
			</div>
		</div>
	);
};

const mapStateToProps = state => {
	return {
		menuVisible: state.ui.menuVisible
	};
};

export default connect(mapStateToProps)(Menu);
