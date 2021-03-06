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

import _ from "lodash";
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { customMapsSuffix } from '../../utils';
import './Query.css';

export class Query extends Component {

  buildQueryItems() {
    const node = this.props.node;

    let queries = _.filter(this.props.queries, (q) => {
      return q.collection === node.type;
    });

    let items = queries.map((q) => {
      if (q.name.includes(customMapsSuffix)) {
        return null;
      }
      return (
        <li key={q.name}>
          <a className="query" target="_blank" rel="noopener noreferrer"
             href={`/tools/report?q=${q._key}&v=${node._id}`}>
            { q.description }
          </a>
        </li>
      );
    });

    return (
      <ul>{items}</ul>
    );
  }

  render() {
    if (!this.props.node)
      return null;

    return (
      <div className="queries">
        { this.buildQueryItems() }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    queries: state.app.queries
  };
}

export default connect(
  mapStateToProps,
  {}
)(Query);
