import {style} from "typestyle";
import {centerJustified, content, horizontal, vertical} from "csstips";
import {insert, remove, update} from "ramda";
import {Icon} from "antd";
import * as React from "react";
import * as KeyboardEventHandler from 'react-keyboard-event-handler';
import AutosizeInput from 'react-input-autosize';

export interface RuleComponentProps {
  ruleIdx: number
  conditions: string[]
  updated: (conditions: string[]) => void
}

export function RuleComponent({conditions, updated, ruleIdx}: RuleComponentProps) {

  return <div className={style(content, horizontal)}>
    Rule a
    {conditions.map((condition: string, conditionIdx: number) => {

        return <div className={style(horizontal)}>

          <KeyboardEventHandler
            className={style(content, horizontal)}
            handleKeys={['backspace']}
            onKeyEvent={() => {
              if (condition === '') {
                updated(remove(conditionIdx, 1, conditions))
                document.getElementById(`rule-${ruleIdx}-condition-${conditionIdx - 1}`).focus()
              }
            }
            }>
            <AutosizeInput
              id={`rule-${ruleIdx}-condition-${conditionIdx}`}
              className={style(content)}
              name="form-field-name"
              placeholder="          "
              placeholderIsMinWidth
              value={condition}
              onChange={event => {
                updated(update(conditionIdx, event.target.value, conditions))
              }}
            />

            <Icon
              className={style(content, vertical, centerJustified, addConditionIcon)}
              type="plus"
              onClick={() => updated(insert(conditionIdx + 1, '', conditions))}/>
          </KeyboardEventHandler>

        </div>
      }
    )}
  </div>;

}


const addConditionIcon = {
  opacity: 0.2,
  marginLeft: 5,
  marginRight: 5,
  $nest: {
    '&:hover': {
      opacity: 1
    }
  },

}
