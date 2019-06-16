import * as React from 'react';
import './Popup.scss';
import {PopUpItem} from "../background/model";

interface AppProps {
}

interface PopupState {
  items: PopUpItem[],
  cursor: number
}

export default class Popup extends React.Component<AppProps, PopupState> {

  constructor(props) {
    super(props)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.state = {
      cursor: 0,
      items: []
    }
  }

  handleKeyDown(e) {
    const { cursor, items } = this.state
    // arrow up/down button should select next/previous list element
    if (e.keyCode === 38 && cursor > 0) {
      this.setState( prevState => ({
        cursor: prevState.cursor - 1
      }))
    } else if (e.keyCode === 40 && cursor < items.length - 1) {
      this.setState( prevState => ({
        cursor: prevState.cursor + 1
      }))
    }
  }

  render() {
    const { cursor } = this.state

    return (
      <div>
        <input onKeyDown={ this.handleKeyDown }/>
        <div>
          {
            this.state.items.map((item, i) => (
              <div
                key={ item.windowId }
                className={cursor === i ? 'active' : null}>
                <span>{ item.name } {item.windowId}</span>
              </div>
            ))
          }
        </div>
      </div>
    )
  }



  componentDidMount() {
    chrome.runtime.sendMessage({type: 'RequestPopupState'}, (response: PopUpItem[]) => {
      this.setState({items: response})
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
