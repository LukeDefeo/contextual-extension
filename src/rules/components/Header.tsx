import {Context} from "../../background/model";
import * as React from 'react'
import {Dropdown, Icon, Layout, Menu} from "antd";
import {classes, style} from "typestyle";
import {padding, fillParent, horizontal, center, endJustified, betweenJustified, content, flex, flex1} from 'csstips'
import {} from "csx";

const {Header, Footer, Sider, Content,} = Layout;


export interface HeaderComponentProps {
  newContext: () => void
  deleteContext: () => void
}

export function HeaderComponent({newContext, deleteContext}: HeaderComponentProps) {

  const menu = (
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
        <Dropdown overlay={menu}>
          <Icon className={style(content)} type="ellipsis" style={{color: "white", fontSize: '20px'}}/>
        </Dropdown>
        <Icon className={style(content)} type="plus" style={{color: "white", fontSize: '20px'}} onClick={newContext}/>
        <Icon className={style(content)} type="delete" style={{color: "white", fontSize: '20px'}} onClick={deleteContext}/>
      </div>
    </Header>
  )

}


const compStye = style()