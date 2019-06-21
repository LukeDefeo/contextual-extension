import {Context} from "../../background/model";
import * as React from 'react'
import {classes, style} from "typestyle";

export interface ContextComponentProps {
  className?: string
  context: Context
}

export function ContextComponent({className, context}: ContextComponentProps) {

  return (
    <div className={classes(className)}>
      {JSON.stringify(context)}
    </div>
  )

}