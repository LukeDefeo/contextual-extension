import * as React from 'react';
import './Popup.scss';
import {PopUpItem} from "../background/model";
import * as KeyboardEventHandler from 'react-keyboard-event-handler';
import {head, tail} from "ramda";

interface AppProps {
}

interface PopupState {
  current?: PopUpItem,
  items: PopUpItem[],
  cursor: number
}

export default class Popup extends React.Component<AppProps, PopupState> {

  constructor(props) {
    super(props)
    this.state = {
      cursor: 0,
      items: []
    }
  }

  focus = (idx: number) => {

    const selectedItem = this.state.items[idx];
    chrome.windows.update(selectedItem.windowId, {
      focused: true
    })
  }

  handleKey = (key) => {
    if (key === 'up') {
      this.setState(prevState => ({
        cursor: prevState.cursor - 1
      }))
    } else if (key === 'down') {
      this.setState(prevState => ({
        cursor: prevState.cursor + 1
      }))
    } else if (key === 'enter' && this.state.items.length > 0) {
      this.focus(this.state.cursor)
    }
  }

  render() {
    const {cursor} = this.state
    return (

      <div
      style={{width: 200}}>
        <div>
          current name {this.state.current && this.state.current.name} id {this.state.current && this.state.current.windowId}
        </div>

        <div>
          {this.state.items.map((item, i) => (
            <div
              onClick={this.focus.bind(this,i)}
              key={item.windowId}
              style={{backgroundColor: i == cursor ? "green" : "blue"}}>
              <span>{item.name} {item.windowId}</span>
            </div>))}
        </div>
        <KeyboardEventHandler
          handleKeys={['up', 'down', 'enter']}
          onKeyEvent={this.handleKey}
        />
      </div>
    )
  }


  componentDidMount() {
    chrome.runtime.sendMessage({type: 'RequestPopupState'}, (response: PopUpItem[]) => {
      console.log("got from background", response)
      this.setState({
        current: head(response),
        items: tail(response)
      })
    })
  }

  // render() {
  //   return (
  //     <div className="popupContainer">
  //       Hello world
  //       ${JSON.stringify(this.state.items)}
  //     </div>
  //   )
  // }
}
