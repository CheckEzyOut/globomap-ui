/*
Copyright 2018 Globo.com

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

import tippy from 'tippy.js';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Properties } from '../';
import './NodeEdges.css';

export class NodeEdges extends Component {

  constructor(props) {
    super(props);
    this.state = {
      inOpen: false,
      outOpen: false
    }

    this.buildEdgeItems = this.buildEdgeItems.bind(this);
    this.onOpenIn = this.onOpenIn.bind(this);
    this.onOpenOut = this.onOpenOut.bind(this);
    this.onOpenProp = this.onOpenProp.bind(this);
    this.closeAll = this.closeAll.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  buildEdgeItems(edges) {
    return edges.map((edge, i) => {
      let noProp = '';

      let edgeType = edge.type;
      if (this.props.namedEdges !== undefined)
        edgeType = this.props.namedEdges[edge.type].alias;

      if (!edge.properties || Object.keys(edge.properties).length === 0) {
        noProp = ' no-prop';
      }
      return <span key={i} className={'edge-item' + noProp} title={edge.name}>
               <span className="edge-item-prop" onClick={(e) => this.onOpenProp(e, edge)}>
                 <i className="icon-right fa fa-caret-right"></i>
                 <i className="icon-down fa fa-caret-down"></i>
          &nbsp;<strong>{edgeType}</strong>: {edge.name}
               </span>
               {edge.properties &&
                <Properties key="properties-node" item={edge} />}
             </span>;
    });
  }

  handleOutsideClick(e) {
    if (this.node && this.node.contains(e.target)) {
      return;
    }
    this.closeAll();
  }

  closeAll() {
    this.setState({ inOpen: false, outOpen: false });
  }

  onOpenIn(event) {
    event.stopPropagation();
    this.setState({ inOpen: !this.state.inOpen, outOpen: false });
  }

  onOpenOut(event) {
    event.stopPropagation();
    this.setState({ outOpen: !this.state.outOpen, inOpen: false });
  }

  onOpenProp(event, edge) {
    event.stopPropagation();

    if(edge.properties && Object.keys(edge.properties).length > 0) {
      return event.currentTarget.parentNode.classList.toggle('open');
    }

    return event.preventDefault();
  }

  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick, false);
    tippy('.edges-btn', {
      arrow: true,
      animation: "fade"
    });
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

  render() {
    let edges = this.props.edges;
    if(edges === undefined) {
      return <div className="sub-node-edges"></div>;
    }
    let colorCls = '';

    const itemGraphs = this.props.graphs.filter((graph) => {
      return graph.name === edges.graph;
    });

    if (itemGraphs.length > 0) {
      colorCls = itemGraphs[0].colorClass;
    }

    let edgesInOut = [
      { dir: 'in', toggleFn: this.onOpenIn, openState: this.state.inOpen, items: this.buildEdgeItems(edges.in) },
      { dir: 'out', toggleFn: this.onOpenOut, openState: this.state.outOpen, items: this.buildEdgeItems(edges.out) }
    ].map((elem) => {
      return elem.items.length > 0
              ? (<div key={elem.dir} className={'edges-' + elem.dir}>
                  <button className={'edges-btn ' + colorCls}
                          onClick={elem.toggleFn}
                          data-tippy-content="Mostrar propriedades da rela&ccedil;&atilde;o">
                    <i className={'fa fa-long-arrow-alt-'+ (elem.dir === 'in' ? 'right' : 'left')}></i>
                  </button>
                  {elem.openState &&
                    <div className="edges-content" onClick={e => e.stopPropagation()}>
                      <div className="tooltip-arrow"></div>
                      <div className={'v-line ' + colorCls}></div>
                      <div className="edges-content-head">
                        Links
                        <button className="close-tooltip-btn" onClick={elem.toggleFn}>
                          <i className="fa fa-times"></i>
                        </button>
                      </div>
                      {elem.items}
                    </div>}
                  </div>)
              : null;
    });

    return (
      <div className={'sub-node-edges ' + this.props.position}
           ref={node => { this.node = node; }}>
        {edgesInOut}
      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    graphs: state.app.graphs,
    namedEdges: state.app.namedEdges
  };
}

export default connect(
  mapStateToProps,
  null
)(NodeEdges);
