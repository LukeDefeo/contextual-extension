import * as React from 'react';
import './Popup.scss';
import {MessageType, PopUpItem} from "../background/model";

interface AppProps {
}

interface PopupState {
  items: PopUpItem[]
}

export default class Popup extends React.Component<AppProps, PopupState> {
  constructor(props: AppProps, state: PopupState) {
    super(props, state);
    this.state = {items: []}
  }

  componentDidMount() {
    chrome.runtime.sendMessage({type: 'RequestPopupState'}, (response: PopUpItem[]) => {
      this.setState({items: response})
    })
  }

  render() {
    return (
      <div className="popupContainer">
        Hello world
        ${JSON.stringify(this.state.items)}
      </div>
    )
  }
}
