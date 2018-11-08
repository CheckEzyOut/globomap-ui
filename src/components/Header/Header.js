/*
Copyright 2017 Globo.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggleGraph } from '../../redux/modules/app';
import { resetSubNodes, findNodes } from '../../redux/modules/nodes';
import { cleanStageNodes } from '../../redux/modules/stage';
import { setMainTab } from '../../redux/modules/tabs';
import './Header.css';

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      checkedGraphs: [],
      checkedCollections: [],
      query: '',
      showOptions: false,
      queryProps: [],
      propsOperators: ["==", "LIKE","NOTIN", "IN", "!=", ">", ">=", "<", "<=", "!~", "=~"]
    };

    this.addProp = this.addProp.bind(this);
    this.removeProp = this.removeProp.bind(this);
    this.handleCheckItem = this.handleCheckItem.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.onSendSearchQuery = this.onSendSearchQuery.bind(this);
    this.onToggleSearchOptions = this.onToggleSearchOptions.bind(this);
    this.onToggleGraph = this.onToggleGraph.bind(this);
    this.closeSearchOptions = this.closeSearchOptions.bind(this);
  }

  addProp() {
    let qProps = this.state.queryProps.slice();
    qProps.push({ 'name': '', 'value': '', 'op': 'LIKE' });
    this.setState({ queryProps: qProps });
  }

  removeProp(index) {
    let qProps = this.state.queryProps.slice();
    qProps.splice(index, 1);
    this.setState({ queryProps: qProps });
  }

  handlePropChange(event, index, item) {
    let qProps = this.state.queryProps.slice();
    qProps[index][item] = event.target.value;
    this.setState({ queryProps: qProps });
  }

  handleCheckItem(event) {
    let target = event.target,
        co = this.state.checkedCollections.slice(),
        itemIndex = co.indexOf(target.name);

    if (itemIndex < 0) {
      co.push(target.name);
    } else {
      co.splice(itemIndex, 1);
    }

    this.setState({ checkedCollections: co });
  }

  handleSearchChange(event) {
    let target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({ [target.name]: value });
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSendSearchQuery(event);
    }
  }

  onSendSearchQuery(event) {
    event.preventDefault();

    this.props.cleanStageNodes();
    this.props.resetSubNodes();
    this.props.setMainTab('Search Results');

    const checkedGraphs = this.state.checkedGraphs;
    let checkedCollections = this.state.checkedCollections;

    if (checkedCollections.length === 0 && checkedGraphs.length === 0) {
      checkedCollections = this.props.collections.map(co => co.name);
    }

    if (checkedCollections.length === 0) {
      return;
    }

    this.props.findNodes({
      query: this.state.query,
      queryProps: this.state.queryProps,
      collections: checkedCollections
    });

    this.closeSearchOptions();
  }

  onToggleSearchOptions(event) {
    event.preventDefault();
    this.setState({ showOptions: !this.state.showOptions });
  }

  onToggleGraph(event, graphName) {
    let collectionsByGraphs = Object.assign({}, this.props.collectionsByGraphs),
        colls = collectionsByGraphs[graphName],
        checkedCollections = this.state.checkedCollections.slice(),
        target = event.target;

    let checkedGraphs = this.props.graphs.filter(graph => {
      return graph.enabled;
    }).map(graph => graph.name);

    let index = checkedGraphs.indexOf(graphName);
    if (index < 0) {
      checkedGraphs.push(graphName);
    } else {
      checkedGraphs.splice(index, 1);
    }

    if (target.checked) {
      checkedCollections = checkedCollections.concat(colls);
    } else {
      colls.forEach((collection) => {
        let hasCheckedGraphs = false;
        for (let i = 0; i < checkedGraphs.length; i++) {
          if (this.props.collectionsByGraphs[checkedGraphs[i]].includes(collection)) {
            hasCheckedGraphs = true;
            break;
          }
        }

        if (!hasCheckedGraphs) {
          index = checkedCollections.indexOf(collection);
          checkedCollections.splice(index, 1);
        }
      });
    }

    this.props.toggleGraph(graphName);
    this.setState({
      checkedGraphs: checkedGraphs,
      checkedCollections: _.uniq(checkedCollections)
    });
  }

  closeSearchOptions() {
    this.setState({ showOptions: false });
  }

  render() {
    const graphButtons = this.props.graphs.map((graph) => {
      const disabledCls = graph.enabled ? '' : ' disabled';

      return <label key={"graph-" + graph.name} className={'item topcoat-checkbox' + disabledCls}>
              <input type="checkbox" name={graph.name} checked={graph.enabled}
                onChange={(e) => this.onToggleGraph(e, graph.name)} />
              <div className="topcoat-checkbox__checkmark"></div>
              &nbsp;<span className={'graph-name ' + graph.colorClass}>{graph.alias}</span>
             </label>;
    });

    const collectionItems = this.props.collections.map((co) => {
      const selectedCollection = this.props.selectedCollections.includes(co.name),
            checkedCollection = this.state.checkedCollections.includes(co.name),
            disabledCls = !selectedCollection ? ' disabled' : '';

      return (
        <label key={co.name} className={"item topcoat-checkbox" + disabledCls}>
          <input type="checkbox" name={co.name} checked={checkedCollection && selectedCollection}
                 onChange={this.handleCheckItem} disabled={!selectedCollection} />
          <div className="topcoat-checkbox__checkmark"></div>&nbsp;{co.alias}
        </label>
      );
    });

    const propItems = this.state.queryProps.map((prop, i) => {
      return (
        <div key={'prop' + i} className="prop-item">
          <input className="prop-query topcoat-text-input--large" type="search"
            name={'prop'+i+'-name'} placeholder="property name" value={this.state.queryProps[i].name}
            onChange={(e) => this.handlePropChange(e, i, 'name')} />

          <select className="prop-operator" name={'prop'+i+'-operator'}
            value={this.state.queryProps[i].op} onChange={(e) => this.handlePropChange(e, i, 'op')}>
            {this.state.propsOperators.map((op, j) => <option key={'op'+j} value={op}>{op}</option>)}
          </select>

          <input className="prop-query topcoat-text-input--large" type="search"
            name={'prop'+i+'-value'} placeholder="value" value={this.state.queryProps[i].value}
            onChange={(e) => this.handlePropChange(e, i, 'value')} />

          <button className="btn-remove-prop topcoat-button--quiet" onClick={() => this.removeProp(i)}>
            <i className="fa fa-times"></i>
          </button>
        </div>
      );
    });

    const searchOptions = (
      <div className="search-box-options">
        <div className="options-container">
          <strong className="option-title">Graphs</strong>
          <div className="graph-items">
            {graphButtons}
          </div>

          <strong className="option-title">Collections</strong>
          <div className="collection-items">
            {collectionItems}
          </div>

          <strong className="option-title">Search by Properties</strong>
          <div className="properties-items">
            {propItems}
            <button className="btn-and-prop topcoat-button" onClick={this.addProp}>+</button>
          </div>
        </div>
        <div className="options-base">
          <button className="topcoat-button--quiet" onClick={this.closeSearchOptions}>Cancel</button>
          <button className="topcoat-button--cta" onClick={this.onSendSearchQuery}
            disabled={this.props.findLoading}>Search</button>
        </div>
      </div>
    );

    const disabledMainSearch = this.state.queryProps.length > 0 && this.state.showOptions;
    return (
      <header className="main-header">
        <div className="header-group">

          <div className="search-box">
            <input className="search-query topcoat-text-input--large" type="search" name="query"
              disabled={disabledMainSearch} value={this.state.query}
              onChange={this.handleSearchChange} onKeyPress={this.handleKeyPress} />

            <button className="btn btn-search" onClick={this.onSendSearchQuery}
              disabled={this.props.findLoading || disabledMainSearch}>
              {this.props.findLoading
                ? <i className="loading-cog fa fa-cog fa-spin fa-fw"></i>
                : <i className="fa fa-search"></i>}
            </button>

            <button className="btn btn-search-options"
              onClick={(e) => this.onToggleSearchOptions(e)}>
              <i className="fa fa-sliders-h"></i>
            </button>

            {this.state.showOptions && searchOptions}
          </div>

        </div>
        {/* <div className="header-sub-group"></div> */}
      </header>
    );
  }

}

function mapStateToProps(state) {
  return {
    graphs: state.app.graphs,
    collections: state.app.collections,
    collectionsByGraphs: state.app.collectionsByGraphs,
    selectedCollections: state.app.selectedCollections,
    findLoading: state.nodes.findLoading
  };
}

export default connect(
  mapStateToProps,
  { toggleGraph, resetSubNodes, findNodes,
    cleanStageNodes, setMainTab }
)(Header);
