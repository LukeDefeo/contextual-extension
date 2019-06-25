import {Context} from "../../background/model";
import * as React from 'react'
import {classes, style, stylesheet} from "typestyle";
import AutosizeInput from 'react-input-autosize';

import {Button, Icon, Input} from 'antd'
import {center, centerJustified, content, flex, horizontal, vertical, width} from "csstips";
import {padding, px} from "csx";
import {append, assocPath, evolve, forEach, insert, lens, lensPath, ManualLens, merge, over, path, prop, remove, set, update} from "ramda";
import * as KeyboardEventHandler from 'react-keyboard-event-handler';
import {Lens} from "../lens";
import {RuleComponent} from "./RuleComponent";

export interface ContextComponentProps {
  className?: string
  context: Context,
  contextUpdated: (context: Context) => void
}


export function ContextComponent({className, context, contextUpdated}: ContextComponentProps) {

  return (
    <div className={classes(className, css.container, style(vertical))}>
      {context && context.rules.map((conditions: string[], ruleIdx: number) =>
        <RuleComponent conditions={conditions} updated={(conditions => {
          if (conditions.length == 0) {
            contextUpdated(evolve({
              rules: remove(ruleIdx, 1)
            }, context))
          } else {
            contextUpdated(assocPath(['rules', ruleIdx], conditions, context))
          }

        })}/>
      )}

      <div className={style(content)}>
        <Button className={style(content)} onClick={() => {
          contextUpdated(assocPath(['rules', context.rules.length], [''], context))
        }}>
          New rule
        </Button>
      </div>

    </div>
  )
}

const css = stylesheet({

  container: {
    padding: padding(10)
  }

})