import {Context} from "./model";
import {curry, map, partial} from "ramda";
import Tab = chrome.tabs.Tab;
import Window = chrome.windows.Window;
import  'chrome-extension-async'
require("chrome-extension-async")
// import "chrome-extension-async";
import {contextForUri} from "./domain";

console.log(`Back ground page initialised ${new Date().toISOString()}`)

let contexts: Context[] = [{
  id: 12312,
  name: "News2",
  rules: [["bbc.co.uk/sport", "sport", "sport"], ["facebook.com", "messages"]]
}, {
  id: 552,
  name: "monitoring",
  rules: [["new-relic"], ["stack driver"]]
}]

let windowState: { [windowId: number]: number } = []
//maybe window state could have a pointer to the actual context?


// Listen to messages sent from other parts of the extension.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // onMessage must return "true" if response is async.
  let isResponseAsync = false;

  if (request.popupMounted) {
    console.log('eventPage notified that Popup.tsx has mounted.');
  }

  return isResponseAsync;
});


chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  console.log(`fTab ${tabId} changed  `, tab)
  console.log("contexts", JSON.stringify(contexts))
  console.log("url", tab.url)

  const context = contextForUri(tab.url, contexts)
  if (context) {
    await moveTabToContext(tab,context.id)
  }
})

chrome.windows.onRemoved.addListener((windowId) => {
  console.log(`window ${windowId} closed`)
})

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  // console.log(`window ${windowId} focused`)
  // await testAsync("foo")
  // console.log(`window ${windowId} focused`)
  // await testAsync("bar")
})


const testAsync: (param: string) => Promise<Tab[]> = async (param: string) => {
  console.log(`pre ${param}`)
  const tabs: Tab[] = await chrome.tabs.query({active: true, currentWindow: true});
  console.log(`post ${param}`)
  console.log(tabs)
  return tabs
}

async function createWindowWithTab(contextId: number, tabId: number): Promise<void> {

  // @ts-ignore
  const window: Window = await chrome.windows.create({
    tabId: tabId
  })
  windowState[window.id] = contextId

  console.log(`created window ${window.id} for context ${contextId}`)
  console.log(`new window state`, windowState)
}

async function windowForContextId(contextId: number): Promise<Window> {
  const windowId = windowState[contextId]
  if (windowId) {
    return await chrome.windows.get(windowId,{})
  } else {
    return Promise.resolve(null)
  }

}

async function moveTabToContext(tab: Tab, contextId: number) {
  const destWindow = await windowForContextId(contextId)
  console.log(`dest window `, destWindow)
  if (destWindow === null) {
    await createWindowWithTab(contextId, tab.id)
  } else if (tab.windowId === destWindow.id) {
    //window already in corr`ect tab
  } else {
    console.log(`tab with url ${tab.url} will be moved to window ${destWindow.id} context ${contextId}`)
    await chrome.tabs.move(tab.id, {
      index: -1,
      windowId: destWindow.id
    })
    // await chrome.tabs.update(tab.id, {
    //   active: true
    // })
  }
}

/**

 (defn <move-tab-to-context! [{:keys [url id windowId] :as tab} context-id]
 (go
 (let [dest-window (<! (<context-id->window context-id))]
 (cond
 (nil? dest-window) (<! (<create-window-with-tab context-id id))
 ;We use the tabs current window rather than the users current window since tabs
 ;can get refreshed when they are in the background in the case of google mail notifications
 (= windowId (:id dest-window)) (println "window already in correct context new")
 :else
 (do
 (println "tab with " url "will be moved to " (:id dest-window))
 (<! (tabs/move id (clj->js {:windowId (:id dest-window) :index -1})))
 (<! (tabs/update id (clj->js {:active true}))))))))


 (defn process-updated-tab! [[_ _ event]]
 (go
 (let [{:keys [url] :as event} (js->clj-keyed event)
 context-id (url->context-id url @*contexts)]
 (when context-id
 (<! (<move-tab-to-context! event context-id))))))

 (defn window-id->context-id [window-id]
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