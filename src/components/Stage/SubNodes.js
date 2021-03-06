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

import React from 'react';
import { connect } from 'react-redux';
import SubNodesByGraph from './SubNodesByGraph';
import './SubNodes.css';

export class SubNodes extends React.Component {

  render() {
    const byGraph = this.props.subNodesByGraph.map(items => {
      return <SubNodesByGraph key={`index_${items.graph}_${items.nodes.length}`}
                              items={items}/>
    });

    return (
      <div className={`subnodes ${this.props.currentNode ? 'show' : ''}`}>
        <div className="subnodes-graph-items">
          {byGraph}
        </div>
      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    currentNode: state.nodes.currentNode,
    subNodesByGraph: state.nodes.subNodesByGraph
  };
}

export default connect(
  mapStateToProps,
  { }
)(SubNodes);
