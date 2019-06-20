import {Context} from "../../background/model";
import * as React from 'react'
import {Col, Dropdown, Icon, Layout, Menu, Row} from "antd";
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
        1st menu item
      </Menu.Item>
      <Menu.Item key="2">
        <Icon type="user"/>
        2nd menu item
      </Menu.Item>
      <Menu.Item key="3">
        <Icon type="user"/>
        3rd item
      </Menu.Item>
    </Menu>
  );

  return (
    <Header color="white" style={{}}>

      <Row type="flex" justify="end">
        {/*<Col span={1} style={{marginLeft: 10, marginRight: 10}}>*/}
        {/*  <Button> Delete </Button>*/}
        {/*</Col>*/}
        <Col>
          <Dropdown overlay={menu}>
            <Icon type="ellipsis" style={{color: "white", fontSize: '20px'}}/>
            {/*<Button>Dropdown</Button>*/}
          </Dropdown>
        </Col>\
        <Col>
          <Icon type="plus" style={{color: "white", fontSize: '20px'}} onClick={newContext}/>
        </Col>
        <Col>
          <Icon type="delete" style={{color: "white", fontSize: '20px'}} onClick={deleteContext}/>
        </Col>
        {/*<Col span={1} style={{}}>*/}
        {/*  <Button> New </Button>*/}

        {/*  /!*<Dropdown.Button overlay={menu} icon={<Icon type="user" />}>*!/*/}
        {/*  /!*  Dropdown*!/*/}
        {/*  /!*</Dropdown.Button>*!/*/}
        {/*</Col>*/}
        {/*<Col span={1}>*/}
        {/*  <Dropdown.Button onClick={this.click} overlay={menu}/>*/}

        {/*</Col>*/}

      </Row>
      {/*<div style={{*/}
      {/*  height: "100%",*/}
      {/*  flex: "auto",*/}
      {/*  justifyContent: "flex-end",*/}
      {/*  alignItems: "center",*/}
      {/*  backgroundColor: "blue",*/}
      {/*  display: "flex"*/}
      {/*}}>*/}
      {/*  <Button> New </Button>*/}
      {/*  <Button> Delete </Button>*/}
      {/*</div>*/}

    </Header>
  )

}