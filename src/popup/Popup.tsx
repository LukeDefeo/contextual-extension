import * as React from 'react';
import './Popup.scss';
import {PopUpItem} from "../background/model";
import * as KeyboardEventHandler from 'react-keyboard-event-handler';
import {clamp, dec, head, inc, partial, prop, tail} from "ramda";
import {classes, style, stylesheet} from "typestyle";
import {center, centerJustified, content, flex, horizontal, startJustified, vertical} from "csstips";
import {Icon, Tooltip} from "antd";

interface AppProps {
}

interface PopupState {
  current?: PopUpItem,
  items: PopUpItem[],
  cursor: number,
}

type Direction = 'up' | 'down'

export default class Popup extends React.Component<AppProps, PopupState> {

  constructor(props) {
    super(props)
    this.state = {
      cursor: 0,
      items: [],
    }
  }

  componentDidMount() {

    //todo if no contexts then open rules automatically?
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

  openRules = () => {
    window.open('/rules.html', "_blank")
  }

  render() {
    const {items, current} = this.state;
    return (

      <div className={classes(style(vertical), css.container)}
           style={{width: 300}}>
        <div className={style(horizontal)}>
          <span className={style(flex, startJustified)}>{current && current.name}</span>
          <div className={style(horizontal, content, center)}>

            {prop('isManaged', current) && (
              <Tooltip autoAdjustOverflow={false} title="Remove all tabs not matching this context" placement="bottomRight"
                       arrowPointAtCenter>
                <Icon className={css.icon} type="scissor" onClick={this.cleanContextKill}/>
              </Tooltip>)}

            <Tooltip autoAdjustOverflow={false} align={ {
              // points: ['tl', 'tr'],        // align top left point of sourceNode with top right point of targetNode
              // offset: [10, 20],            // the offset sourceNode by 10px in x and 20px in y,
              // targetOffset: ['30%','40%'], // the offset targetNode by 30% of targetNode width in x and 40% of targetNode height in y,
              overflow: { adjustX: true, adjustY: true }, // auto adjust position when sourceNode is overflowed
            }} overlayStyle={{fontSize: 12, verticalAlign: 'center'}} title="Configure contexts"
                     placement="bottomRight" arrowPointAtCenter>
              <Icon className={css.icon} type="setting" onClick={this.openRules}/>
            </Tooltip>
          </div>
        </div>
        <div className={style({
          width: "100%",
          height: 1,
          backgroundColor: "black",
          marginTop: 4,
          marginBottom: 8
        })}/>

        <div className={style(vertical)}>
          {items.map((item, i) => {
            const setHighlighted = () => {
              console.log(`highlighting ${i}`)
              return this.setState({cursor: i});
            }
            return (
              <div
                key={item.windowId}
                className={classes(css.basePopUpItem, i == this.state.cursor && css.highlightedPopupItem)}
                // onMouseEnter={setHighlighted} //for some reason you neeed both?
                // onMouseOver={setHighlighted}
                onMouseMove={setHighlighted}
                onClick={partial(this.focus, [i])}>
                <span>{item.name}</span>
              </div>);
          })}
        </div>
        <KeyboardEventHandler
          handleKeys={['up', 'down', 'enter']}
          onKeyEvent={this.handleKey}
        />
      </div>
    )
  }
}

const css = stylesheet({

  container: {
    padding: 10
  },
  basePopUpItem: {

    backgroundColor: 'white'
  },
  highlightedPopupItem: {
    backgroundColor: '#eee'

  },
  icon: {
    marginRight: 10
  }
})
