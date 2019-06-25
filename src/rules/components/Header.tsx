import * as React from 'react'
import {Dropdown, Icon, Layout, Menu} from "antd";
import {style} from "typestyle";
import {center, content, endJustified, flex, horizontal, padding} from 'csstips'
import {color, px} from "csx";
import {NestedCSSProperties} from "typestyle/lib/types";

const {Header} = Layout;

export interface HeaderComponentProps {
  newContext: () => void
  deleteContext: () => void
  save: () => void
}

export function HeaderComponent({newContext, deleteContext, save}: HeaderComponentProps) {

  const overflowDropDownMenu = (
    <Menu
      // onClick={this.click}
    >
      <Menu.Item key="1">
        <Icon type="user"/>
        Import
      </Menu.Item>
      <Menu.Item key="2">
        <Icon type="user"/>
        Export
      </Menu.Item>
    </Menu>
  );


  return (
    <Header className={style(padding(0, 20), horizontal, center)}>
      <span className={style(content, {color: "white"})}> Contextual rule configuration</span>
      <div className={style(horizontal, flex, endJustified)}>
        <Dropdown overlay={overflowDropDownMenu}>
          <Icon className={style(content, iconClass)} type="ellipsis"/>
        </Dropdown>
        <Icon className={style(content, iconClass)} type="save" onClick={save}/>
        <Icon className={style(content, iconClass)} type="plus" onClick={newContext}/>
        <Icon className={style(content, iconClass)} type="delete" onClick={deleteContext}/>
      </div>
    </Header>
  )
}

const iconClass: NestedCSSProperties = {
  color: "white",
  fontSize: px(20)
};