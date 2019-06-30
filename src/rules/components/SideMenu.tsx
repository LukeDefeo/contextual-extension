import {Context} from "../../background/model";
import * as React from 'react'
import {Menu} from "antd";
import {addIndex, map} from "ramda";

export interface SideMenuComponentProps {
  contexts: Context[],
  selectedIdx?: number
  updateSelectedIdx: (idx: number) => void
}

export function SideMenuComponent({contexts, selectedIdx, updateSelectedIdx}: SideMenuComponentProps) {

  const onclick = (e) => updateSelectedIdx(parseInt(e.key))
  const selectedKeys = selectedIdx !== undefined ? [selectedIdx.toString()] : undefined

  const mapIndexed = addIndex(map)
  return (
    <Menu
      onSelect={onclick}
      onClick={onclick}
      style={{width: 256, height: "100%"}}
      selectedKeys={selectedKeys}
      mode="inline">
      {mapIndexed((context: Context, idx: number) => <Menu.Item key={idx.toString()}>{context.name}</Menu.Item>, contexts)}
    </Menu>
  )
}


