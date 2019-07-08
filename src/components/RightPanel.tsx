/* Copyright 2018 Mozilla Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as React from 'react';
import { Header } from './Header';
import { DirectoryTree } from './DirectoryTree';
import { Project, File, Directory, ModelRef } from '../models';
import { SplitOrientation, SplitInfo, Split } from './Split';
import appStore from '../stores/AppStore';
import CallContractDialog from './CallContractDialog';
import { IceteaWeb3 } from '@iceteachain/web3';
const tweb3 = new IceteaWeb3('https://rpc.icetea.io');

export interface MethodInfo {
  name?: string;
  decorators?: string[];
  params?: { name?: string; type?: string }[];
}

export interface RightPanelProps {
  /**
   * Active file.
   */
  address: string[];
  contractName: string;
}
export interface RightPanelState {
  splits: SplitInfo[];
  listFunc: MethodInfo[];
  funcInfo: {};
  addr: String;
  isCallParam: boolean;
}

export function tryStringifyJsonHelper(p, replacer, space) {
  if (typeof p === 'string') {
    return p;
  }
  try {
    return JSON.stringify(p, replacer, space);
  } catch (e) {
    return String(p);
  }
}

export function tryStringifyJson(value) {
  return tryStringifyJsonHelper(value, undefined, 2);
}

export function replaceAll(text, search, replacement) {
  return text.split(search).join(replacement);
}

export function tryParseJson(p) {
  try {
    return JSON.parse(p);
  } catch (e) {
    return p;
  }
}

export function parseParamsFromField(selector) {
  return parseParamList(document.querySelector(selector).value.trim());
}

export function parseParamList(pText) {
  pText = replaceAll(pText, '\r', '\n');
  pText = replaceAll(pText, '\n\n', '\n');
  let params = pText
    .split('\n')
    .filter(e => e.trim())
    .map(tryParseJson);

  return params;
}

export function formatResult(r, isError) {
  const fail = isError || r.deliver_tx.code || r.check_tx.code;
  let msg;
  if (fail) {
    msg =
      '<b>Result</b>: <span class="Error":>ERROR</span><br><b>Message</b>: <span class="Error">' +
      (r.deliver_tx.log || r.check_tx.log || tryStringifyJson(r)) +
      '</span>' +
      '<br><b>Hash</b>: ';
    if (r.hash) {
      msg += '<a href="/tx.html?hash=' + r.hash + '">' + r.hash + '</a>';
    } else {
      msg += 'N/A';
    }
    return msg;
  } else {
    msg =
      '<b>Result</b>: <span class="Success"><b>SUCCESS</b></span>' +
      '<br><b>Returned Value</b>:  <span class="Success">' +
      tryStringifyJson(r.returnValue) +
      '</span>' +
      '<br><b>Hash</b>: <a href="https://devtools.icetea.io/tx.html?hash=' +
      r.hash +
      '" target="_blank" rel="noopener noreferrer">' +
      r.hash +
      '</a>';
    msg +=
      '<br><b>Height</b>: ' +
      r.height +
      '<br><b>Tags</b>: ' +
      tryStringifyJson(r.tags) +
      '<br><b>Events:</b> ' +
      tryStringifyJson(r.events);
    return msg;
  }
}

export class RightPanel extends React.Component<RightPanelProps, RightPanelState> {
  directoryTree: DirectoryTree;
  constructor(props: any) {
    super(props);
    this.state = {
      splits: [
        {},
        {
          value: 300,
        },
        {
          value: 400,
        },
      ],
      listFunc: [],
      funcInfo: {},
      addr: '',
      isCallParam: false,
    };
  }

  componentDidMount() {
    // appStore.onDidChangeDirty.register(this.refreshTree);
    // appStore.onDidChangeChildren.register(this.refreshTree);
    const { address } = this.props;
    if (address.length > 0) {
      this.setState({ addr: address[0] });
      this.getFuncList(address[0]);
    }
  }

  componentWillReceiveProps(nextState) {
    const { addr } = this.state;
    // console.log("view address", addr);
    // console.log("view next address", nextState.address);
    // if (addr != nextState.addr) {
    //   tweb3.getMetadata(nextState.addr).then(funcs => {
    //     console.log('Funcs from Metadata',funcs);
    //     this.setState({ listFunc: funcs });
    //   });
    // }
  }

  componentWillUnmount() {
    // appStore.onDidChangeDirty.unregister(this.refreshTree);
    // appStore.onDidChangeChildren.unregister(this.refreshTree);
  }

  refreshTree = () => {
    this.directoryTree.tree.refresh();
  };

  getFuncList(address) {
    tweb3.getMetadata(address).then(funcs => {
      console.log('funcs', funcs);
      const newFunc = Object.keys(funcs).map(item => {
        const meta = funcs[item];
        return {
          name: item,
          decorators: meta.decorators || [],
          params: meta.params || [],
        };
      });

      this.setState({ listFunc: newFunc });
    });
  }

  callContractMethod = async func => {
    let result;
    try {
      const params = func.params;
      if (params.length > 0) {
        this.setState({ isCallParam: true, funcInfo: func });
      } else {
        document.getElementById('funcName').innerHTML = func.name;
        document.getElementById('resultJson').innerHTML = "<span class='Error'>sending...</span>";
        const addr = this.state.addr;
        const name = func.name;
        const ct = tweb3.contract(addr);
        result = await ct.methods[name](...params).sendCommit();
        console.log(result);
        document.getElementById('resultJson').innerHTML = formatResult(result, false);
      }
    } catch (error) {
      console.log(error);
      document.getElementById('resultJson').innerHTML = formatResult(error, true);
    }
  };

  changeAddress(event: React.FormEvent) {
    const address = (event.target as any).value;
    console.log(address); // in chrome => B
    this.setState(
      {
        addr: address,
      },
      () => {
        this.getFuncList(address);
      }
    );
  }

  render() {
    const { contractName, address } = this.props;
    const { funcInfo, listFunc, isCallParam, addr } = this.state;
    console.log('RightPanel');

    const makeMethodCallContract = () => {
      return listFunc.map((func: MethodInfo, i: number) => {
        return (
          <li className="list-group-item row">
            <div className="row">
              <div className="col-7">
                <span className="badge badge-warning d-inline">function</span>
                <span className="mx-1 px-1 text-danger">{func.name}</span>
              </div>
              <div className="col-2">
                <button
                  type="button"
                  className="btn btn-outline-warning py-0 px-3 ml-3"
                  onClick={() => this.callContractMethod(func)}
                >
                  Call
                </button>
              </div>
            </div>
          </li>
        );
      });
    };

    return (
      <div className="rightPanelContainer">
        <div className="wasmStudioHeader">
          <span className="waHeaderText" />
        </div>
        {address ? (
          <div style={{ height: 'calc(100% - 41px)' }}>
            <Split
              name="CallContract"
              orientation={SplitOrientation.Horizontal}
              splits={this.state.splits}
              onChange={splits => {
                this.setState({ splits: splits });
              }}
            >
              <div />
              <div className="wrapper-method-list card">
                {/* <div className="card-header font-weight-bold border-light align-middle">Contracts:</div> */}
                <div className="mt-1">
                  {/* <div className="card-header border-bottom border-primary bg-black">
                    <div className="row justify-content-around align-items-center">
                      <div className="col">
                        <span className="badge badge-success">Deployed</span>
                        <span className="contract-name">:{contractName}</span>
                      </div>
                      <div className="col-1">
                        <span
                          title="icon expand"
                          aria-hidden="true"
                          aria-controls="collapse_contract"
                          aria-expanded="true"
                          className="btn btn-black oi oi-caret-bottom"
                        />
                      </div>
                    </div>
                  </div> */}
                  <div id="collapse_contract" className="collapse show">
                    <div className="row contract-instance-address px-4 py-2 font-weight-bold text-pure-white">
                      <span className="badge badge-success">Deployed contract address: </span>
                      <div className="py-1">
                        <select className="custom-select" id="callContractAddr" onChange={e => this.changeAddress(e)}>
                          {address.map((addr, i) => (
                            <option key={i} value={addr}>
                              {addr}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <ul className="list-group list-group-flush bg-dark">{makeMethodCallContract()}</ul>
                  </div>
                </div>
              </div>
              <div className="fill">
                <div style={{ height: 'calc(100% - 40px)' }}>
                  <span>Result</span>
                  <section id="result">
                    <div>
                      <b id="funcName" />
                    </div>
                    <div>
                      <code id="resultJson" />
                    </div>
                  </section>
                </div>
              </div>
            </Split>
            {isCallParam && (
              <CallContractDialog
                isOpen={isCallParam}
                funcInfo={funcInfo}
                address={addr}
                onCancel={() => {
                  this.setState({ isCallParam: false });
                }}
              />
            )}
          </div>
        ) : (
          <p style={{ flex: 1, padding: '8px' }}>No deployed contract. Deploy one first.</p>
        )}
      </div>
    );
  }
}