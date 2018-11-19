import React from 'react';
import { connect } from 'react-redux';
import { registerTab, setTab } from '../../redux/modules/tabs';

class Tab extends React.Component {

  componentDidMount() {
    this.props.registerTab(this.props.tabKey);
  }

  render() {
    return React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        className: this.props.currentTab === this.props.tabKey ? 'active' : '',
        onClick: () => this.props.setTab(this.props.tabKey)
      });
    });
  }

}

function mapStateToProps(state) {
  return {
    currentTab: state.tabs.currentTab
  };
}

export default connect(
  mapStateToProps,
  { registerTab, setTab }
)(Tab);
