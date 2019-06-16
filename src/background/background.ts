import {Context, ContextWindowMapping, MessageRequestType, WindowContextMapping} from "./model";
import {append, assoc, curry, equals, fromPairs, invertObj, map, partial, pipe, prepend, toPairs, uniq} from "ramda";
import Tab = chrome.tabs.Tab;
import Window = chrome.windows.Window;
import 'chrome-extension-async'

require("chrome-extension-async")
// import "chrome-extension-async";
import {contextForUri, createPopupState} from "./domain";
import reject from "ramda/es/reject";

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


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  const msgType: MessageRequestType = message.type
  if (msgType === 'RequestPopupState') {
    sendResponse(createPopupState(windowIdFocusOrder, windowIdContextIdMapping(), contexts))
  } else {
    console.log(`Unknown message from sender ${sender.id} `, message)
  }
});


// Listen to messages sent from other parts of the extension.

chrome.runtime.onConnect.addListener(port => {

  port.onMessage.addListener(function (msg) {
    console.log("message recieved" + msg);
    port.postMessage("Hi Popup.js");
  });
})
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {


  console.log(`Got message from ${sender}`)
  // onMessage must return "true" if response is async.
  let isResponseAsync = false;

  if (request.popupMounted) {
    console.log('eventPage notified that Popup.tsx has mounted.');
  }

  return isResponseAsync;
});


chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  // console.log(`tab ${tabId} updated`, tab)
  // console.log("contexts", JSON.stringify(contexts))
  // console.log("url", tab.url)

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

/*

   defn window-id->context-id [window-id]
 (get (set/map-invert @*context->window-state) window-id))

 (defn handle-window-focused! [window-id]
 (swap! *ordered-windows-state #(distinct (cons window-id %)))
 (println @*ordered-windows-state "<<<  windows focused"))

 (defn handle-closed-window! [window-id]
 (swap! *ordered-windows-state #(remove (partial = window-id) %))
 (if-let [context-id (window-id->context-id window-id)]
 (do
 (swap! *context->window-state dissoc context-id)
 (println "removed window " window-id " from state for context" context-id))
 (println "unknown window closed"))
 (println "state now" @*context->window-state))

 (defn join-window-id-to-contexts [contexts window-state ordered-windows]
 (let [inverted-window-state (set/map-invert window-state)

 order-windows-with-ctx-id (map (fn [window-id]
 {:id        (get inverted-window-state window-id :unmanaged)
                                          :window-id window-id}) (remove #(= % -1) ordered-windows))]
 (map (fn [{:keys [id window-id]}]

 (let [name (->>
 contexts
 (filter (fn [x] (= id (:id x))))
 first
 :name)]
 {:window-id window-id
              :name      (or name "Unmanaged")}))
 order-windows-with-ctx-id)))

 (defn get-context-switcher-state []
 (join-window-id-to-contexts @*contexts @*context->window-state @*ordered-windows-state))

 ;;todo migrate to this in util
 (defn find-context-by-id [id contexts]
 (select-first [ALL (selected? :id #(= % id))] @*contexts))

 (defn <clean-current-context []
 (go
 (let [{:keys [id tabs] :as current-window} (js->clj-keyed-first (<! (windows/get-current (clj->js {:populate true}))))

 current-ctx-id (window-id->context-id id)

 current-ctx (select-first [ALL (selected? :id #(= % current-ctx-id))] @*contexts)

 to-kill (->>
 tabs
 (remove (fn [tab] (url-matches-context? (:url tab) current-ctx)))
 (map :id))]

 (when current-ctx
 (tabs/remove (clj->js to-kill))))))
 /**
 (defn process-chrome-event [event]
 (go
 (let [[event-id event-args] event]
 (case event-id
 ::runtime/on-connect (apply handle-client-connection! event-args)
 ::windows/on-removed (tm/handle-closed-window! (first event-args))
 ::windows/on-focus-changed (tm/handle-window-focused! (first (js->clj-keyed event-args)))
 ::tabs/on-updated (<! (tm/process-updated-tab! event-args))
 ::commands/on-command (<! (tm/<clean-current-context))
 nil))))
 */