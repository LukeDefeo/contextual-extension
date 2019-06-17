import * as React from "react";
import {Context, PopUpItem} from "../background/model";

interface AppProps {
}

interface RulesState {
  contexts: Context[],
}


export default class Popup extends React.Component<AppProps, RulesState> {


  render() {
    return (
      <div>
        Hello world
      </div>
    );
  }
}