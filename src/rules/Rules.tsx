import * as React from "react";
import {Context, Database, newContext} from "../background/model";
import "chrome-extension-async";
import {adjust, update, always, append, nth, remove, replace} from "ramda";
import {ContextComponent} from "./components/ContextComponent";
import {SideMenuComponent} from "./components/SideMenu";
import {HeaderComponent} from "./components/Header";
import {fillParent, flex, horizontal, vertical} from "csstips";
import {style} from "typestyle";

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
  //disable context?

  componentWillUpdate(nextProps: Readonly<{}>, nextState: Readonly<RulesState>, nextContext: any): void {

    console.log("new props", nextProps)
    console.log("new state", nextState)
  }

  updateStateFromStorage = (contexts: Context[]) => this.setState((prev) => ({
    contexts: contexts,
    selectedIdx: (!prev.selectedIdx && contexts.length > 0) ? contexts.length - 1 : prev.selectedIdx
  }))

  newContext = () => this.setState(cur => ({
    contexts: append(newContext("New context"), cur.contexts),
    selectedIdx: cur.contexts.length
  }))

  contextUpdated = (context: Context) => this.setState(prev => {
    console.log("got updated ctx ", context, this.state.selectedIdx)


    let contexts = update(prev.selectedIdx, context, prev.contexts);
    console.log("done?", contexts)
    return ({
      contexts: contexts
    });
  })

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
          save={this.save}
          newContext={this.newContext}
          deleteContext={this.deleteContext}/>

        <div className={style(flex, horizontal)}>
          <SideMenuComponent
            {...this.state}
            updateSelectedIdx={this.contextSelected}/>
          <ContextComponent
            className={style(flex)}
            contextUpdated={this.contextUpdated}
            context={nth(this.state.selectedIdx, this.state.contexts)}/>
        </div>
      </div>
    )

  }
}