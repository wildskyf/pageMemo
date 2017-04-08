var isDev = true;

var pageMemo = {
  contextmenu_info: null,

  init: () => {
    pageMemo
      .initContextMenuEventListener()
      .createContextMenuButton()
      .initMessageListener();
  },

  initContextMenuEventListener: () => {
    isDev && console.log('init ContextMenu Event Listener');

    var pageMemoFunc = {
      'new-note': info => {
        isDev && console.log('ContextMenu new-note onClicked');
        var cm = pageMemo.contextmenu_info, x = null;
        cm.sendRes({ x: cm.x });
      },

      'show-notes': info => {
        isDev && console.log('ContextMenu show-note onClicked');
      }
    };

    browser.contextMenus.onClicked.addListener((info, tab) => {
      pageMemoFunc[info.menuItemId](info);
    });

    return pageMemo;
  },

  createContextMenuButton: () => {
    isDev && console.log('create ContextMenu Button');
    var menu = {
      new_note: 'new-note',
      show_notes: 'show-notes'
    };

    browser.contextMenus.create({
      id: menu.new_note,
      title: "Create New Note",
      contexts: ["all"]
    });

    browser.contextMenus.create({
      id: menu.show_notes,
      type: "checkbox",
      title: "Show All Notes",
      contexts: ["all"],
      checked: false
    });
    return pageMemo;
  },

  _fixFFstorageBug: results => {
    if ((typeof results.length === 'number') && (results.length > 0)) {
      results = results[0];
    }
    return results;
  },

  initMessageListener: () => {
    isDev && console.log('init Message Listener');

    var fixFFstorageBug = pageMemo._fixFFstorageBug;

    browser.runtime.onMessage.addListener( (msg, sender, sendRes) => {
      switch (msg.behavior) {
        case 'init':
          isDev && console.log('onMessage init');
          browser.storage.local.get( results => {
            results = fixFFstorageBug(results);
            sendRes(results[msg.url]);
          });
          return true;
          break;
        case 'del_memo':
          isDev && console.log('onMessage del_memo', msg);
          browser.storage.local.get( results => {
            results = fixFFstorageBug(results);
            delete results[msg.url][msg.memo_id];
            browser.storage.local.set(results);
          });
          return true;
          break;
        case 'record_mouse_position':
          isDev && console.log('record_mouse_position', msg);
          pageMemo.contextmenu_info = {
            x: msg.x,
            atTab: sender.tab.id,
            pageWidth: msg.pageWidth,
            sendRes: sendRes
          };
          return true; // for send res async
          break;
        case 'save_memo':
          isDev && console.log('onMessage save_memo');
          browser.storage.local.get( results => {
            results = fixFFstorageBug(results);

            var pageMemo_data = results || {};
            var data = pageMemo_data[msg.url] = pageMemo_data[msg.url] || {};
            var memo = data[msg.memo_id] = data[msg.memo_id] || {};

            memo.position = msg.position;
            memo.val = msg.val;

            browser.storage.local.set(pageMemo_data);
          });
          break;
      }
    });
    return pageMemo;
  }
};
pageMemo.init();
