const COLORs = ['lightyellow', 'lightblue', 'pink', 'lightgreen'];

var Memo = {
  $container: null,
  $newDiv: document.createElement('div'),
  $newHoldbar: document.createElement('div'),
  $delBtn: document.createElement('a'),
  $optionBtn: document.createElement('a'),
  $newTextarea: document.createElement('textarea'),

  create: info => {
    var me = Memo;
    var { key, x, y, val, color, isInit } = info;

    me._createContnainer({
      key: key,
      x: x,
      y: y
    });
    me._createHolder();
    me._createButtons();
    me._createTextarea({
      val: val,
      color: color
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
    var { $newHoldbar, $newTextarea, $newDiv, _save } = Memo;

    var moving = false;
    var toggleMoving = () => {
      moving = !moving;
      if (moving) {
        $newHoldbar.style.cursor = 'grabbing';
        $newTextarea.style.cursor = 'grabbing';

        width = $newDiv.offsetWidth / 2;

        document.addEventListener('mousemove', e => {
          if (moving) {
            var x = e.clientX - width;
            var y = e.clientY - document.querySelector('body').getBoundingClientRect().y;

            $newDiv.style.left = x+'px';
            $newDiv.style.top = y+'px';
            $newDiv.style.right = undefined;
          };
        });
      }
      else {
        $newHoldbar.style.cursor = 'grab';
        $newTextarea.style.cursor = 'auto';
        _save();
      }
    }

    $newHoldbar.addEventListener('click', toggleMoving);
    $newHoldbar.classList.add('holder');
    $newHoldbar.textContent = browser.i18n.getMessage("moveHint");
  },

  _createButtons: () => {
    var { $delBtn, $optionBtn, _save } = Memo;

    // delete button
    $delBtn.classList.add('delete', 'btn');
    $delBtn.title = "delete";
    $delBtn.textContent = 'X';
    $delBtn.addEventListener('click', () => {
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
      var ta_style = $optionBtn.querySelector('textarea').style;
      var currentColorNo = COLORs.indexOf(ta_style.backgroundColor);
      ta_style.backgroundColor = COLORs[(currentColorNo + 1) % COLORs.length];
      _save();
    });
  },

  _createTextarea: info => {
    var { $newTextarea, _save } = Memo;

    $newTextarea.rows = "7";
    $newTextarea.style.background = info.color || COLORs[0];
    $newTextarea.value = info.val || "";

    $newTextarea.addEventListener('focusout', _save);
    $newTextarea.addEventListener('keypress', _save);
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
    var { $newTextarea, $newDiv } = Memo;

    browser.runtime.sendMessage({
      behavior: 'save_memo',
      url: location.href,
      memo_id: $newTextarea.parentNode.dataset['pagememoId'],
      val: $newTextarea.value,
      color: $newTextarea.style.backgroundColor,
      position: {
        x: $newDiv.style.left,
        y: $newDiv.style.top,
        width: $newDiv.style.width
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
      Memo.create({
        x: memo.position.x,
        y: memo.position.y,
        val: memo.val,
        color: memo.color,
        isInit: true,
        key: key
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
