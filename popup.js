// sending simple messaages

// (async () => {
//     const response = await chrome.runtime.sendMessage({msg: 'github_tabs'})
//     console.log(response)
// })()

// const tabs = await chrome.tabs.query({
//     url: [
//         "https://github.com/*"
//     ]
// })

// DOM node
const templateDOM = document.querySelector("template"); //template DOM node
// sending messages in long live connection
const port = chrome.runtime.connect({ name: "grouping" });
port.postMessage({ msg: "send_groupId" });
port.onMessage.addListener(async (msg) => {
  const tabs = await chrome.tabs.query({ groupId: msg.groupId });
    console.log(tabs)
  const listElementSet = new Set();
  let templateContentDOM = null

  for (let tab of tabs) {
    templateContentDOM = templateDOM.content.firstElementChild.cloneNode(true);
    templateContentDOM.querySelector("h1").textContent = tab.title;
    templateContentDOM.querySelector("p").textContent = tab.url;

    // adding click eventlistener to the list element and
    templateContentDOM.addEventListener("click", async () => {
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.window.update(tab.windowId, { focused: true });
    });

    listElementSet.add(templateContentDOM);
  }

  document.querySelector("ul").append(...listElementSet);

});
