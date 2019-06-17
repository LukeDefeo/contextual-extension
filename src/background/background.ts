import {Context, ContextWindowMapping, MessageRequestType, WindowContextMapping} from "./model";
import {append, assoc, curry, equals, filter, find, fromPairs, invertObj, map, partial, pipe, prepend, prop, toPairs, uniq} from "ramda";
import Tab = chrome.tabs.Tab;
import Window = chrome.windows.Window;
import 'chrome-extension-async'

// require("chrome-extension-async")
import "chrome-extension-async";
import {contextForUri, createPopupState, doesUrlMatchContext} from "./domain";
import reject from "ramda/es/reject";
import {threadLast} from "./thread";

console.log(`Back ground page initialised ${new Date().toISOString()}`)

let contexts: Context[] = [{
  id: 12312,
  name: "News2",
  rules: [["bbc.co.uk/sport", "sport", "sport"], ["facebook.com", "messages"]]
}, {
  id: 552,
  name: "Play",
  rules: [["reddit.com"], ["stack driver"]]
}]

//these values are mutated
let contextIdToWindowIdMapping: ContextWindowMapping = []

//this is for the popup to present the windows/ contexts the the order they have been switched to by the user
let windowIdFocusOrder: number[] = []

function windowIdContextIdMapping(): WindowContextMapping {
  // @ts-ignore
  return pipe(
    invertObj,
    toPairs,
    curry(map(([k, v]) => [k, parseInt(v, 10)])),
    fromPairs as any
  )(contextIdToWindowIdMapping)
}

//maybe window state could have a pointer to the actual context... the context can change independantly of this data, its better to think of them relationally

chrome.commands.onCommand.addListener(async (command: string) => {

  console.log(`got command ${command}`)
  if (command === 'clean_context_kill') {
    const window = await chrome.windows.getCurrent()
    await cleanContextKill(window.id)
  }
})


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

  const msgType: MessageRequestType = message.type
  if (msgType === 'RequestPopupState') {
    sendResponse(createPopupState(windowIdFocusOrder, windowIdContextIdMapping(), contexts))
  } else if (msgType === 'CleanContextKillCommand') {
    await cleanContextKill(message.windowId)
  } else {
    console.log(`Unknown message from sender ${sender.id} `, message)
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {

  const context = contextForUri(tab.url, contexts)
  if (context) {
    if (info.status === 'loading') {
      console.log('tab is "loading" ... not moving')
    } else {
      await moveTabToContext(tab, context.id)
    }
  }
})

chrome.windows.onRemoved.addListener((windowId) => {

  // remove from mapping
  const windowIdToContextIdMapping = invertObj(contextIdToWindowIdMapping)
  const contextId = windowIdToContextIdMapping[windowId]
  console.log(`window ${windowId} closed, dissoc'ing context ${contextId}`)
  delete contextIdToWindowIdMapping[contextId]

  //update window id focus order
  windowIdFocusOrder = reject(curry(equals(windowId)), windowIdFocusOrder)
  console.log(`new windows focused`, windowIdFocusOrder)
})

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  windowIdFocusOrder = uniq(prepend(windowId, windowIdFocusOrder))
  console.log(`new windows focused`, windowIdFocusOrder)
})

async function cleanContextKill(windowId: number) {
  console.log(`clean kill window ${windowId}`)
  const window = await chrome.windows.get(windowId, {populate: true})
  const contextId = windowIdContextIdMapping()[windowId]
  const currentContext = find(ctx => ctx.id === contextId, contexts)

  if (currentContext) {

    threadLast(
      window.tabs,
      reject(((tab: Tab) => doesUrlMatchContext(tab.url, currentContext) !== null)),
      map(prop('id')),
      tabs => {
        chrome.tabs.remove(tabs)
      }
    )
  }

}

async function createWindowWithTab(contextId: number, tabId: number): Promise<void> {

  // @ts-ignore
  const window: Window = await chrome.windows.create({
    tabId: tabId
  })
  contextIdToWindowIdMapping[contextId] = window.id

  console.log(`created window ${window.id} for context ${contextId}`)
  console.log(`new window state`, contextIdToWindowIdMapping)
}

async function windowForContextId(contextId: number): Promise<Window> {
  const windowId = contextIdToWindowIdMapping[contextId]
  if (windowId) {
    return await chrome.windows.get(windowId, {})
  } else {
    return Promise.resolve(null)
  }

}

async function moveTabToContext(tab: Tab, contextId: number) {
  const destWindow = await windowForContextId(contextId)
  if (destWindow === null) {
    console.log(`No window for ${contextId} ... creating with tab ${tab.id}`, destWindow)
    await createWindowWithTab(contextId, tab.id)
  } else if (tab.windowId === destWindow.id) {
    console.log(`${tab.id} already in the correct context`)
  } else {
    console.log(`tab with url ${tab.url} will be moved to window ${destWindow.id} context ${contextId}`)
    await chrome.tabs.move(tab.id, {
      index: -1,
      windowId: destWindow.id
    })
    await chrome.tabs.update(tab.id, {
      active: true
    })

    await chrome.windows.update(destWindow.id, {
      focused: true
    })
  }
}