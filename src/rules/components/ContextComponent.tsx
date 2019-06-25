import {Context} from "../../background/model";
import * as React from 'react'
import {classes, style, stylesheet} from "typestyle";
import AutosizeInput from 'react-input-autosize';

import {Button, Icon, Input} from 'antd'
import {center, centerJustified, content, flex, horizontal, vertical, width} from "csstips";
import {padding, px} from "csx";
import {append, forEach, insert, lensPath, ManualLens, merge, over, path, prop, remove, set, update} from "ramda";
import * as KeyboardEventHandler from 'react-keyboard-event-handler';

export interface ContextComponentProps {
  className?: string
  context: Context,

  contextUpdated: (context: Context) => void
}

type Path = string | number []

interface Cursor<T> {
  value: T,
  path: Path
}

function cursor(obj: any, path: Path) {

}

function get(cusor:) {

}

type Person = {
  name: string;
  age: number;
  accounts: Array<Account>;
};

type Account = {
  type: string;
  handle: string;
  foad: string;
};

import {lens, LensImpl, Lens} from '../lens';

const x: Lens<Person, string> = lens<Person>().k("accounts").k(0).k("type")

x.set("")
x.set( x => x)

lens<Person>()
  .k('accounts')
  .k(0)
  .set(x => {
    return {
      type: "",
      handle: "",
      foad: ""
    }
  })


class CursorLens<S, D> {

  private readonly value: S;
  private readonly path: string | number[]
  private readonly lens: LensImpl<S, D>

  private watchers: ((T) => void)[] = []

  constructor(original: S, lens: LensImpl<S, D>) {
    this.value = original
    this.lens = lens
  }

  get(): D {
    return this.lens.get()(this.value)
  }

  update(updateFn: (D) => D) {
    this.lens.set(updateFn)
    this.watchers.forEach(watcher => {
      watcher(this.value)
    })
  }

  subLens<ND>(newLens: Lens<D, ND>) {

    const x = this.lens.compose(newLens)

  }

  addWatch(watch: (T) => void) {
    this.watchers.push(watch)
  }

}


class CursorC<T> {
  private value: T;
  private path: string | number[]
  private lens = lensPath(this.path)

  private watchers: ((T) => void)[] = []

  constructor(original: T, path: string | number[]) {
    this.value = original
    this.path = path
    let lensPath1: ManualLens<any, any> = lensPath('foo');
  }

  get(): any {
    path(this.path, this.value)
  }

  update(updateFn: (any) => any) {
    this.value = over(this.lens, updateFn, this.value) as any

    this.watchers.forEach(watcher => {
      watcher(this.value)
    })
  }

  addWatch(watch: (T) => void) {
    this.watchers.push(watch)
  }

}

export function ContextComponent({className, context, contextUpdated}: ContextComponentProps) {

  return (
    <div className={classes(className, css.container, style(vertical))}>
      {context && context.rules.map((condtions: string[], ruleIdx: number) => {
          const ruleLens = lensPath(['rules', ruleIdx])

          return <div className={style(content, horizontal)}>
            Rule {ruleIdx}
            {condtions.map((condition: string, conditionIdx: number) => {

                const textLens = lensPath(['rules', ruleIdx, conditionIdx])

                return <div className={style(horizontal)}>

                  <KeyboardEventHandler
                    className={style(content, horizontal)}
                    handleKeys={['backspace']}
                    onKeyEvent={(f) => {
                      if (condition === '') {
                        contextUpdated(over(ruleLens, (orig: string[]) => remove(conditionIdx, 1, orig), context) as any)
                      }
                      console.log("key", f)
                    }
                    }>
                    <AutosizeInput
                      className={style(content)}
                      name="form-field-name"
                      placeholder="          "
                      placeholderIsMinWidth
                      value={condition}
                      onChange={function (event) {
                        contextUpdated(set(textLens, event.target.value, context) as Context)
                        console.log(event.target.value)
                        console.log(event.target)
                        console.log(event)
                      }}
                    />

                    <Icon
                      className={classes(css.addConditionIcon, style(content, vertical, centerJustified))}
                      type="plus"
                      onClick={(e) => {
                        let context1: any = over(ruleLens, (orig: string[]) => insert(conditionIdx + 1, '', orig), context);
                        console.log('new', context1)
                        contextUpdated(context1)
                      }}/>
                  </KeyboardEventHandler>

                </div>

              }
            )}

            {/*<Icon*/}
            {/*  className={classes(css.addConditionIcon, style(content, vertical, centerJustified))}*/}
            {/*  type="plus"*/}
            {/*  onClick={(e) => {*/}
            {/*    let context1: any = over(ruleLens, append(''), context);*/}
            {/*    console.log('new', context1)*/}
            {/*    contextUpdated(context1)*/}
            {/*  }}/>*/}

          </div>;
        }
      )}


      <div className={style(content)}>
        <Button className={style(content)} onClick={() => {

          const rulesLens = lensPath(['rules'])

          contextUpdated(over(rulesLens, append(['']), context) as any)
        }}>
          New rule
        </Button>
      </div>

    </div>
  )
}

merge(style(content, horizontal, centerJustified, center,))

const css = stylesheet({

  container: {
    padding: padding(10)
  },

  addConditionIcon: {
    opacity: 0.2,
    marginLeft: 5,
    marginRight: 5,
    $nest: {
      '&:hover': {
        opacity: 1
      }
    },

  }


})