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

import * as React from "react";
import { Header } from "./Header";
import { DirectoryTree } from "./DirectoryTree";
import { Project, File, Directory, ModelRef } from "../models";
import { SplitOrientation, SplitInfo, Split } from "./Split";
import appStore from "../stores/AppStore";

export interface RightPanelProps {
  /**
   * Active file.
   */
  // file: ModelRef<File>;
  // project: ModelRef<Project>;
  // onEditFile?: (file: File) => void;
  // onDeleteFile?: (file: File) => void;
  // onMoveFile?: (file: File, directory: Directory) => void;
  // onRenameFile?: (file: File) => void;
  // onNewFile?: (directory: Directory) => void;
  // onNewDirectory?: (directory: Directory) => void;
  // onClickFile: (file: File) => void;
  // onDoubleClickFile?: (file: File) => void;
  // onUploadFile?: (directory: Directory) => void;
  // onCreateGist: (fileOrDirectory: File) => void;
}

export interface RightPanelState {
  splits: SplitInfo[];
}

export class RightPanel extends React.Component<
  RightPanelProps,
  RightPanelState
> {
  directoryTree: DirectoryTree;
  constructor(props: any) {
    super(props);
    this.state = {
      splits: []
    };
  }
  componentDidMount() {
    // appStore.onDidChangeDirty.register(this.refreshTree);
    // appStore.onDidChangeChildren.register(this.refreshTree);
  }
  componentWillUnmount() {
    // appStore.onDidChangeDirty.unregister(this.refreshTree);
    // appStore.onDidChangeChildren.unregister(this.refreshTree);
  }
  refreshTree = () => {
    this.directoryTree.tree.refresh();
  };
  render() {
    // const project = this.props.project;
    const { splits } = this.state;

    return (
      <div className="workspaceContainer">
        <Header />
        <div style={{ height: "calc(100% - 41px)" }}>
          <Split
            name="Workspace"
            orientation={SplitOrientation.Horizontal}
            splits={this.state.splits}
            onChange={splits => {
              this.setState({ splits: splits });
            }}
          >
            <div />
            <div>
              <div className="contract-item card bg-transparent">
                <div className="card-header font-weight-bold border-light align-middle">
                  Contracts:
                </div>
                <div className="mt-1">
                  <div className="card-header border-bottom border-primary bg-black">
                    <div className="row justify-content-around align-items-center">
                      <div className="col">
                        <span className="badge badge-success">Deployed</span>
                        <span className="contract-name">:SimpleStore</span>
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
                  </div>
                  <div id="collapse_contract" className="collapse show">
                    <div className="row contract-instance-address bg-skyblue px-4 py-2 font-weight-bold text-pure-white">
                      Contract address:
                      0x685c155bb26de65a3f00f9ecfbfe34eaae56584c
                    </div>
                    <ul className="list-group list-group-flush bg-dark">
                      <li className="list-group-item row">
                        <div className="row">
                          <div className="col-7">
                            <span className="badge badge-warning d-inline">
                              function
                            </span>
                            <span className="mx-1 px-1 text-danger">set</span>
                          </div>
                          <div className="col-2">
                            <button
                              type="button"
                              className="btn btn-outline-warning py-0 px-3 ml-3"
                            >
                              Call
                            </button>
                          </div>
                        </div>
                      </li>
                      <li className="list-group-item row">
                        <div className="row">
                          <div className="col-7">
                            <span className="badge badge-warning d-inline">
                              function
                            </span>
                            <span className="mx-1 px-1 text-danger">set</span>
                          </div>
                          <div className="col-2">
                            <button
                              type="button"
                              className="btn btn-outline-warning py-0 px-3 ml-3"
                            >
                              Call
                            </button>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Split>
        </div>
      </div>
    );
  }
}
