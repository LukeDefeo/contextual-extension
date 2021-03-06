import * as React from "react";
import {Context, Database, newContext} from "../background/model";
import "chrome-extension-async";
import {append,length, defaultTo, nth, path, remove, update} from "ramda";
import {ContextComponent} from "./components/ContextComponent";
import {SideMenuComponent} from "./components/SideMenu";
import {HeaderComponent} from "./components/Header";
import {fillParent, flex, horizontal, vertical} from "csstips";
import {style} from "typestyle";

interface RulesState {
  contexts: Context[],
  selectedIdx?: number
  exportModalVisible: boolean
}

export default class Rules extends React.Component<{}, RulesState> {

  constructor(props) {
    super(props)
    this.state = {
      contexts: [],
      exportModalVisible: false
    }
  }

  async componentDidMount(): Promise<void> {

    const db: Database = await chrome.storage.sync.get() as any

    console.log('initial read', db)

    this.applyContextsToState(db.contexts)

    chrome.storage.onChanged.addListener(changes => {
      const newStateFromStorage: Context[] = path(['contexts','newValue'], changes)
      this.applyContextsToState(newStateFromStorage)
    })
  }

  //todo add help
  //disable context?

  componentWillUpdate(nextProps: Readonly<{}>, nextState: Readonly<RulesState>, nextContext: any): void {
    console.log("new props", nextProps)
    console.log("new state", nextState)
  }

  applyContextsToState = (contexts: Context[]) => this.setState((prev) => ({
    contexts: defaultTo([],contexts),
    selectedIdx: (!prev.selectedIdx &&  length(contexts) > 0) ? contexts.length - 1 : prev.selectedIdx
  }))

  newContext = () => this.setState(cur => ({
    contexts: append(newContext("New context"), cur.contexts),
    selectedIdx: cur.contexts.length
  }))

  contextUpdated = (context: Context) => this.setState(prev => ({
    contexts: update(prev.selectedIdx, context, prev.contexts)
  }))

  deleteContext = () => this.setState(cur => {

    const newContexts = remove(cur.selectedIdx, 1, cur.contexts);
    return ({
      contexts: newContexts,
      selectedIdx: (newContexts.length - 1)
    });
  })


  save = () => chrome.storage.sync.set({
    contexts: this.state.contexts
  })

  contextSelected = (idx: number) => this.setState({selectedIdx: idx})

  render() {

    return (
      <div className={style(fillParent, vertical)}>

        <HeaderComponent
          contexts={this.state.contexts}
          updateContexts={this.applyContextsToState}
          save={this.save}
          newContext={this.newContext}
          deleteContext={this.deleteContext}/>

        <div className={style(flex, horizontal)}>
          <SideMenuComponent
            {...this.state}
            updateSelectedIdx={this.contextSelected}/>
          {length(this.state.contexts) > 0 && <ContextComponent
            className={style(flex)}
            contextUpdated={this.contextUpdated}
            context={nth(this.state.selectedIdx, this.state.contexts)}/>}

        </div>
      </div>
    )

  }
}