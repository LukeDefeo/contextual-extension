import {Context} from "../../background/model";
import * as React from 'react'
import {Menu} from "antd";

export interface SideMenuComponentProps {
  contexts: Context[],
  selectedIdx?: number
  updateSelectedIdx: (idx: number) => void
}

export function SideMenuComponent({contexts, selectedIdx, updateSelectedIdx}: SideMenuComponentProps) {

  const onclick = (e) => updateSelectedIdx(parseInt(e.key))
  const selectedKeys = selectedIdx !== undefined ?  [selectedIdx.toString()]: undefined

  return (
    <Menu
      onSelect={onclick}
      onClick={onclick}
      style={{width: 256, height: "100%"}}
      selectedKeys={selectedKeys}
      // defaultSelectedKeys={selectedKeys}
      defaultOpenKeys={['sub1']}
      mode="inline">
      {contexts.map((c, i) =>
        <Menu.Item key={i.toString()}>{c.name}</Menu.Item>)
      }
    </Menu>
  )
}


