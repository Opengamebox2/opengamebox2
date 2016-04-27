import React from 'react';
import {connect} from 'react-redux';
import {Tabs, Tab} from 'react-bootstrap';
import MenuController from './MenuController.react';
import PlayerList from './PlayerList.react';
import Favorites from './Favorites.react';

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
        <Tabs defaultActiveKey={1} id="menu-tabs">
          <Tab eventKey={1} title="Players">
            <PlayerList />
          </Tab>
          <Tab eventKey={2} title="Favorites">
            <Favorites />
          </Tab>
          <Tab eventKey={3} title="Settings">
          </Tab>
        </Tabs>
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
