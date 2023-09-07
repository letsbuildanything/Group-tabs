let groupId = null;

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install" || reason === "update") {
    chrome.storage.local.clear(() => {
      const error = chrome.runtime.error;
      if (error) {
        console.error(error);
      } else {
        console.log("All data is cleared");
      }
    });
  }
});

chrome.tabGroups.onRemoved.addListener((group) => {
  chrome.storage.local.clear(() => {
    const error = chrome.runtime.error;
    if (error) {
      console.error(error);
    } else {
      groupId = null;
      console.log("All data is cleared");
    }
  });
});

chrome.storage.local.get("groupId", (result) => {
  console.log("checking execution....");
  if (!groupId && result.groupId) {
    groupId = result.groupId;
  }
});

chrome.webNavigation.onCompleted.addListener(
  (details) => {
    // chrome.storage.local.get("groupId", async (result) => {
    //   if (!groupId) {

    //     // when service worker will go idle(become non-persistent)
    //     if (result.groupId) {
    //       groupId = result.groupId;
    //     } else {
    //       groupId = await chrome.tabs.group({ tabIds: details.tabId });
    //       chrome.storage.local.set({ groupId }, (key, value) => {
    //         console.log(`${value} got set!`);
    //       });
    //     }

    //     chrome.tabGroups.update(groupId, { color: "green", title: "repo" });
    //   } else {
    //     chrome.tabs.group({ tabIds: details.tabId, groupId: groupId });
    //   }
    // });
    chrome.tabs.get(details.tabId, async (tab) => {

      if (!groupId) {
        groupId = await chrome.tabs.group({ tabIds: details.tabId, createProperties: {windowId: tab.windowId} });
        chrome.tabGroups.update(groupId, { color: "green", title: "repo" });
        chrome.storage.local.set({ groupId }, (key, value) => {
          console.log(`${value} got set!`);
        });
      } else {
        chrome.tabs.group({ tabIds: details.tabId, groupId: groupId });
      }
    });
  },
  { url: [{ urlMatches: "https://github.com/*" }] }
);

// connection listener
chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name === "grouping");
  port.onMessage.addListener((message) => {
    console.log(message); // delete later
    if (message.msg === "send_groupId" && groupId) {
      port.postMessage({ groupId: groupId });
    }
  });

  port.onDisconnect.addListener(() => {
    console.log("port disconnected");
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.url &&
    !(changeInfo.url.includes("github.com") && tab.groupId !== -1)
  ) {
    chrome.tabs.ungroup(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // delete later
  console.log(tabId, removeInfo);
});
