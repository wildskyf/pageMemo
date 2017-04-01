var contextmenu_info = null;
var menu = {
  new_note: 'new-note',
  show_notes: 'show-notes'
};

var pageMemoFunc = {
  'new-note': info => {
    var cm = contextmenu_info, x = null, isRight = false;
    if (cm.x < cm.pageWidth/2) {
      x = cm.x - 200;
      x = x < 20 ? 20 : x;
      isRight = false;
    }
    else {
      x = cm.x + 200;
      x = x > (cm.pageWidth - 20) ? 20 : (cm.pageWidth - x);
      isRight = true;
    }
    cm.sendRes({ x: x, isRight: isRight });
  },

  'show-notes': info => {
    console.log('run show notes code');
  }
};

chrome.contextMenus.onClicked.addListener((info, tab) => {
  pageMemoFunc[info.menuItemId](info);
});

chrome.contextMenus.create({
  id: menu.new_note,
  title: "Create New Note",
  contexts: ["all"]
});

chrome.contextMenus.create({
  id: menu.show_notes,
  type: "checkbox",
  title: "Show All Notes",
  contexts: ["all"],
  checked: false
});

browser.runtime.onMessage.addListener( (msg, sender, sendRes) => {
  console.log(sender.url);
  contextmenu_info = {
    x: msg.x,
    atTab: sender.tab.id,
    pageWidth: msg.pageWidth,
    sendRes: sendRes
  };
  return true; // for send res async
});
