import {Context} from "../../background/model";
import * as React from 'react'

export interface ContextComponentProps {
  context: Context
}

export function ContextComponent({context}: ContextComponentProps) {

  return (
    <div>
      {JSON.stringify(context)}
    </div>
  )

}