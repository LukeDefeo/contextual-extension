import * as React from "react";
import {Context, Database, newContext} from "../background/model";
import {Layout} from 'antd'
import "chrome-extension-async";
import {append, remove} from "ramda";
import {ContextComponent} from "./components/ContextComponent";
import {SideMenuComponent} from "./components/SideMenu";
import {HeaderComponent} from "./components/Header";
import {fillParent} from "csstips";

const {Sider, Content,} = Layout;

interface RulesState {
  contexts: Context[],
  selectedIdx?: number
}

export default class Rules extends React.Component<{}, RulesState> {

  constructor(props) {
    super(props)
    this.state = {
      contexts: []
    }
  }

  updateStateFromStorage(contexts: Context[]) {
    this.setState((prev) => ({
      contexts: contexts,
      selectedIdx: (!prev.selectedIdx && contexts.length > 0) ? 0 : prev.selectedIdx
    }))
  }

  async componentDidMount(): Promise<void> {

    const db: Database = await chrome.storage.sync.get() as any

    console.log('initial read', db)

    this.updateStateFromStorage(db.contexts)

    chrome.storage.onChanged.addListener(changes => {
      this.updateStateFromStorage(changes['contexts'].newValue)
    })
  }

  //todo add help
  //import export
  //disable context

  componentWillUpdate(nextProps: Readonly<{}>, nextState: Readonly<RulesState>, nextContext: any): void {

    console.log("new props", nextProps)
    console.log("new state", nextState)
  }

  deleteContext = () => {
    this.setState(cur => ({
      contexts: remove(cur.selectedIdx, 1, cur.contexts)
    }))
  }

  newContext = () => {
    this.setState((cur) => ({
      contexts: append(newContext("New context"), cur.contexts)
    }))
  }

  contextSelected = (idx: number) => {
    this.setState({
      selectedIdx: idx
    })
  }

  render() {

    return (
      <Layout style={fillParent}>
        <HeaderComponent newContext={this.newContext} deleteContext={this.deleteContext}/>
        <Layout>
          <Sider>
            <SideMenuComponent
              {...this.state}
              updateSelectedIdx={this.contextSelected}
            />
          </Sider>
          <Content>
            {this.state.contexts.length > 0 && <ContextComponent context={this.state.contexts[this.state.selectedIdx]}/>}
          </Content>
        </Layout>
      </Layout>


    )
  }
}