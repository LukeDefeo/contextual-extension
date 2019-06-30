import {Context} from "../../background/model";
import * as React from 'react'
import {classes, style, stylesheet} from "typestyle";
import AutosizeInput from 'react-input-autosize';

import {Button, Icon, Input} from 'antd'
import {center, centerJustified, content, flex, horizontal, vertical, width} from "csstips";
import {padding, px} from "csx";
import {append, assoc, assocPath, evolve, forEach, insert, lens, lensPath, merge, over, path, prop, remove, set, update} from "ramda";
import {RuleComponent} from "./RuleComponent";

export interface ContextComponentProps {
  className?: string
  context: Context,
  contextUpdated: (context: Context) => void
}


export function ContextComponent({className, context, contextUpdated}: ContextComponentProps) {

  return (
    <div className={classes(className, css.container, style(vertical))}>

      <Input
        value={context.name}
        onChange={(e) => {
          contextUpdated(assoc('name', e.target.value, context))
        }}>
      </Input>

      {context && context.rules.map((conditions: string[], ruleIdx: number) =>
        <RuleComponent ruleIdx={ruleIdx} conditions={conditions} updated={(conditions => {
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
        <Button
          onClick={() => contextUpdated(assocPath(['rules', context.rules.length], [''], context))}
          className={style(content)}>
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