const COLORs = ['lightyellow', 'lightblue', 'pink', 'lightgreen'];


var Memo = {
  $container: null,
  $newDiv: null,
  $newHoldbar: null,
  $delBtn: null,
  $optionBtn: null,
  $newTextarea: null,

  create: info => {
    var me = Memo;
    me.$container = null;
    me.$newDiv = document.createElement('div');
    me.$newHoldbar = document.createElement('div');
    me.$delBtn = document.createElement('a');
    me.$optionBtn = document.createElement('a');
    me.$newTextarea = document.createElement('textarea');

    var { key, x, y, val, color, isInit, width } = info;

    me._createContnainer({
      key: key,
      x: x,
      y: y
    });
    me._createHolder();
    me._createButtons();
    me._createTextarea({
      val: val,
      color: color,
      width: width
    });
    me._combine(isInit);
  },

  _createContnainer: info => {
    var { $newDiv } = Memo;
    $newDiv.classList.add('pageMemo');
    $newDiv.dataset['pagememoId'] = info.key || window.crypto.getRandomValues(new Uint16Array(1)); // start from 0
    $newDiv.style.top = parseInt(info.y) + 'px';
    $newDiv.style.left = parseInt(info.x) + 'px';
  },

  _createHolder: () => {
    var { $newDiv, $newHoldbar, $newTextarea, $newDiv, _save } = Memo;

    // ref: http://jsfiddle.net/fpb7j/1/
    var eleMouseMove = ev => {
      var pX = ev.pageX - ( $newDiv.clientWidth/2 );
      var pY = ev.pageY - 10;
      $newDiv.style.left = pX + "px";
      $newDiv.style.top = pY + "px";
      document.addEventListener("mouseup" , eleMouseUp , false);
    }

    function eleMouseUp () {
      document.removeEventListener("mousemove" , eleMouseMove , false);
      document.removeEventListener("mouseup" , eleMouseUp , false);

      _save();
    }

    $newHoldbar.addEventListener("mousedown", () => {
      document.addEventListener("mousemove" , eleMouseMove , false);
    }, false);
    $newHoldbar.classList.add('holder');
    $newHoldbar.textContent = browser.i18n.getMessage("moveHint");
  },

  _createButtons: () => {
    var { $newTextarea, $delBtn, $optionBtn, _save } = Memo;

    // delete button
    $delBtn.classList.add('delete', 'btn');
    $delBtn.title = "delete";
    $delBtn.textContent = 'X';
    $delBtn.addEventListener('click', () => {
      if (!confirm(browser.i18n.getMessage("confirmDel"))) return;
      $delBtn.parentNode.remove();
      browser.runtime.sendMessage({
        behavior: 'del_memo',
        url: location.href,
        memo_id: $delBtn.parentNode.dataset['pagememoId']
      });
    });

    // option button
    $optionBtn.classList.add('option', 'btn');
    $optionBtn.title = "change color";
    $optionBtn.textContent = 'O';
    $optionBtn.addEventListener('click', e => {
      var ta_style = $newTextarea.style;
      var currentColorNo = COLORs.indexOf(ta_style.backgroundColor);
      ta_style.backgroundColor = COLORs[(currentColorNo + 1) % COLORs.length];
      _save();
    });
  },

  _createTextarea: info => {
    var { $newTextarea, _save } = Memo;

    $newTextarea.rows = "7";
    $newTextarea.style.background = info.color || COLORs[0];
    $newTextarea.style.width = info.width || "auto";

    $newTextarea.value = info.val || "";

    $newTextarea.addEventListener('focusout', _save);
    $newTextarea.addEventListener('keypress', _save);
    $newTextarea.addEventListener('mouseup', _save);
  },

  _combine: isInit => {
    var { $newDiv, $newHoldbar, $delBtn, $optionBtn, $newTextarea } = Memo;

    $newDiv.appendChild($newHoldbar);
    $newDiv.appendChild($delBtn);
    $newDiv.appendChild($optionBtn);
    $newDiv.appendChild($newTextarea);
    document.body.appendChild($newDiv);

    if (!isInit) $newTextarea.focus();
  },

  _save: () => {
    var { $newDiv, $newTextarea, $newDiv } = Memo;

    browser.runtime.sendMessage({
      behavior: 'save_memo',
      url: location.href,
      memo_id: $newDiv.dataset['pagememoId'],
      val: $newTextarea.value,
      color: $newTextarea.style.backgroundColor || COLORs[0],
      width: $newTextarea.style.width,
      position: {
        x: $newDiv.style.left,
        y: $newDiv.style.top
      }
    });
  }
};

document.addEventListener('contextmenu', e => {
  browser.runtime.sendMessage({
    behavior: 'record_mouse_position',
    x: e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
    pageWidth: document.body.clientWidth
  }).then( res => {
    Memo.create({
      x: res.x,
      y: e.clientY + document.body.scrollTop + document.documentElement.scrollTop,
      isInit: false
    });
  });
});

browser.runtime.sendMessage({
  behavior: 'init',
  url: location.href
}).then( memos => {
  if (memos) {
    for (var key in memos) {
      var memo = memos[key];
      console.log(memo);
      Memo.create({
        x: memo.position.x,
        y: memo.position.y,
        val: memo.val,
        color: memo.color,
        isInit: true,
        key: key,
        width: memo.width
      });
    }
  }
});

browser.runtime.onMessage.addListener( (msg, sender, sendRes) => {
  var all_notes = Array.from(document.querySelectorAll('.pageMemo'));
  all_notes.forEach( note => {
    if (msg.behavior == 'show-all') {
      note.style.display = 'block';
    }
    else if (msg.behavior == 'hide-all') {
      note.style.display = 'none';
    }
  });
});
