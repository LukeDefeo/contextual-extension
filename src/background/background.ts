import {Context} from "./model";
import {curry, map, partial} from "ramda";

console.log("Back ground page initialised")

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


chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  console.log(`Tab ${tabId} changed  `, tab)
})

chrome.windows.onRemoved.addListener((windowId) => {
  console.log(`window ${windowId} closed`)
})


chrome.windows.onFocusChanged.addListener((windowId) => {
  console.log(`window ${windowId} focused`)
})

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