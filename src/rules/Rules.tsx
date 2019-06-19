import * as React from "react";
import {Context, Database} from "../background/model";
import {Button, Radio, Input} from 'antd'
import "chrome-extension-async";


//this for config https://www.npmjs.com/package/react-scripts-ts-antd
interface AppProps {
}

interface RulesState {
  contexts: Context[]
}

export default class Rules extends React.Component<AppProps, RulesState> {

  constructor(props) {
    super(props)
    this.state = {
      contexts: []
    }
  }

  async componentDidMount(): Promise<void> {

    const db: Database = await chrome.storage.sync.get() as any

    console.log('initial read', db)

    this.setState({
      contexts: db.contexts
    })

    chrome.storage.onChanged.addListener(changes => {
      this.setState({
        'contexts': changes['contexts'].newValue
      })
    })
  }

  click = async (e) => {
    console.log("clicked")
    await chrome.storage.sync.set({
      "contexts": [{
        id: 123,
        name: "Prod",
        rules: [
          ["console.cloud.google.com", "project=just-data"]
        ]
      }, {
        id: 1234,
        name: "QA",
        rules: [["console.cloud.google.com", "project=justeat-datalake"]]
      }, {
        id: 1236,
        name: "Dev",
        rules: [["console.cloud.google.com", "project=just-data-sandbox"]]
      }, {
        id: 12312,
        name: "News",
        rules: [["bbc.co.uk/sport", "sport", "sport"], ["facebook.com", "messages"]]
      }, {
        id: 552,
        name: "Play",
        rules: [["reddit.com"], ["stack driver"]]
      }]
    })

    console.log("post clicked")
  }

  render() {
    return (
      <div>
        <Input placeholder="hello  usage" />
        <Radio  name="foo"/>
        <Button title="hello">

        </Button>
        <button onClick={this.click}>
        </button>
        Hello world
        ${JSON.stringify(this.state.contexts)}
      </div>
    );
  }
}