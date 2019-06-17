import * as React from 'react';
import './Popup.scss';
import {PopUpItem} from "../background/model";
import * as KeyboardEventHandler from 'react-keyboard-event-handler';
import {clamp, dec, head, inc, partial, tail} from "ramda";

interface AppProps {
}

interface PopupState {
  current?: PopUpItem,
  items: PopUpItem[],
  cursor: number,
  hoverIdx: number,
}

type Direction = 'up' | 'down'

export default class Popup extends React.Component<AppProps, PopupState> {

  constructor(props) {
    super(props)
    this.state = {
      cursor: 0,
      items: [],
      hoverIdx: -1
    }
  }

  componentDidMount() {
    chrome.runtime.sendMessage({type: 'RequestPopupState'}, (response: PopUpItem[]) => {
      this.setState({
        current: head(response),
        items: tail(response)
      })
    })
  }

  cleanContextKill = () => {
    console.log('cleaning ...')
    chrome.runtime.sendMessage({
      type: 'CleanContextKillCommand',
      windowId: this.state.current.windowId
    })
    window.close()
  }

  focus = (idx: number) => {

    const selectedItem = this.state.items[idx];
    chrome.windows.update(selectedItem.windowId, {
      focused: true
    })
    window.close()
  }

  nextCursor = (cursor: number, nItems: number, direction: Direction) => {

    const fn = direction === 'down' ? inc : dec
    const clamper = clamp(0, nItems - 1)

    return clamper(fn(cursor))
  }

  handleKey = (key) => {

    //todo wrap around cycling behaviour
    if (key === 'up') {
      this.setState(prevState => ({
        cursor: this.nextCursor(prevState.cursor, prevState.items.length, 'up')
      }))
    } else if (key === 'down') {
      this.setState(prevState => ({
        cursor: this.nextCursor(prevState.cursor, prevState.items.length, 'down')
      }))
    } else if (key === 'enter' && this.state.items.length > 0) {
      this.focus(this.state.cursor)
    }
  }

  render() {
    const {items, current, hoverIdx} = this.state;
    return (

      <div
        style={{width: 200}}>
        <div>
          current name {current && current.name} id {current && current.windowId}
          <button onClick={this.cleanContextKill}>
            Clean ctx kill
          </button>
        </div>

        <div>
          {items.map((item, i) => (
            <div
              onMouseOver={(e) => {
                this.setState({
                  hoverIdx: i
                })
              }}
              onMouseLeave={() => {
                this.setState({
                  hoverIdx: -1
                })
              }}
              onClick={partial(this.focus, [i])}
              key={item.windowId}
              style={{backgroundColor: i == hoverIdx ? "green" : "blue"}}>
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


  // render() {
  //   return (
  //     <div className="popupContainer">
  //       Hello world
  //       ${JSON.stringify(this.state.items)}
  //     </div>
  //   )
  // }
}
