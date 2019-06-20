import * as React from "react";
import {Context, Database, newContext} from "../background/model";
import {Button, Col, Dropdown, Icon, Input, Layout, Menu, Radio, Row} from 'antd'
import "chrome-extension-async";
import {append, remove} from "ramda";
import {ContextComponent} from "./components/ContextComponent";
import {SideMenuComponent} from "./components/SideMenu";
import id = chrome.runtime.id;
import {HeaderComponent} from "./components/Header";

const {Header, Footer, Sider, Content,} = Layout;

const {SubMenu} = Menu;

//this for config https://www.npmjs.com/package/react-scripts-ts-antd
interface AppProps {
}

interface RulesState {
  contexts: Context[],
  selectedIdx?: number
}

export default class Rules extends React.Component<AppProps, RulesState> {

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

  componentWillUpdate(nextProps: Readonly<AppProps>, nextState: Readonly<RulesState>, nextContext: any): void {

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
      <div style={{width: "100%", height: "100%"}}>
        <Layout style={{width: "100%", height: "100%"}}>
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

      </div>
    )
  }
}