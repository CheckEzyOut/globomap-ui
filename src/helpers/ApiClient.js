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

import axios from 'axios';
import { host } from '../config'

export default class ApiClient {

  constructor() {
    ['get', 'post', 'delete'].forEach(method => {
      this[method] = (path, params={}, data={}) => {
        return axios[method](this.formatUrl(path), {
          params: params,
          data: data
        });
      }
    })
  }

  formatUrl(path) {
    path = path[0] !== '/' ? `/${path}` : path;
    return `${host}${path}`;
  }

}
