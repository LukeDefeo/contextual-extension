import * as React from 'react'
import {useState} from "react";

import {Dropdown, Icon, Layout, Menu, Modal, Input} from "antd";
import {style} from "typestyle";
import {center, content, endJustified, flex, horizontal, padding} from 'csstips'
import {color, px} from "csx";
import {NestedCSSProperties} from "typestyle/lib/types";
import {Context} from "../../background/model";

const {TextArea} = Input;
const {Header} = Layout;

type Action = () => void;

export interface HeaderComponentProps {
  newContext: Action
  deleteContext: Action
  save: Action
  updateContexts: (contexts: Context[]) => void
  contexts: Context[]
}

export function HeaderComponent({newContext, deleteContext, save, contexts, updateContexts}: HeaderComponentProps) {

  const [importVisible, setImportVisible] = useState(false);
  const [importText, setImportText] = useState('');

  const [exportVisible, setExportVisible] = useState(false);

  const overflowDropDownMenu = (
    <Menu>
      <Menu.Item key="1" onClick={() => setImportVisible(true)}>
        <Icon type="import"/>
        Import
      </Menu.Item>
      <Menu.Item key="2" onClick={() => setExportVisible(true)}>
        <Icon type="export"/>
        Export
      </Menu.Item>
    </Menu>
  );


  return (
    <Header className={style(padding(0, 20), horizontal, center)}>
      <Modal
        title="JSON model"
        visible={exportVisible}
        onCancel={() => setExportVisible(false)}
        footer={null}>
        <pre>
          {JSON.stringify(contexts, null, 2)}
        </pre>
      </Modal>
      <Modal
        title="Paste JSON model"
        visible={importVisible}
        onCancel={() => setImportVisible(false)}
        onOk={() => {
          const parsed: any = JSON.parse(importText)
          console.log('parsed import', parsed) // todo add validation,
          updateContexts(parsed)
          setImportVisible(false)
        }}>
        <TextArea rows={16} value={importText} onChange={(e) => setImportText(e.target.value)}>
        </TextArea>
      </Modal>
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