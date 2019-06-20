
export interface Context {
  id: number,
  name: string,
  rules: string[][]
  //each rule is a list of conditions which is just a part of a url to match against
}

export interface PopUpItem {
  windowId: number
  name: string
}

export type ContextWindowMapping = { [contextId: number]: number }
export type WindowContextMapping = { [contextId: number]: number }


export type MessageRequestType = 'RequestPopupState' | 'CleanContextKillCommand' | 'RequestContexts'

export interface Database {
  contexts: Context[]
}

export function newContext(name: string) : Context {
  return {
    id: Date.now(),
    name: name,
    rules: []
  }
}