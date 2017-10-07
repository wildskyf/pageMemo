var createMemo = info => {
  var {x, y, val} = info;

  var newDiv = document.createElement('div');
  var newTextarea = document.createElement('textarea');
  var newHoldbar = document.createElement('div');
  var newBtn = document.createElement('a');
  var newBtnText = document.createTextNode('X');

  // div
  newDiv.classList.add('pageMemo');
  newDiv.dataset['pagememoId'] = key || window.crypto.getRandomValues(new Uint16Array(1)); // start from 0
  newDiv.style.position = 'absolute';
  newDiv.style.top = parseInt(y) + 'px';
  newDiv.style.zIndex = 9999;
  newDiv.style.left = parseInt(x) + 'px';

  newTextarea.addEventListener('focus', () => {
    newDiv.style.opacity = '1';
  });
  newTextarea.addEventListener('focusout', () => {
    newDiv.style.opacity = '0.2';
  });

  // textarea
  newTextarea.rows = "7";
  if (val) newTextarea.value = val;
  var memoStyles = {
    'background': 'lightyellow',
    'color':      '#555',
    'outline':    'none',
    'border':     '1px solid #999',
    'padding':    '2em 1em 1em',
    'boxShadow':  '1px 1px 5px rgba(0,0,0,0.2)'
  };
  for( var style in memoStyles) {
    newTextarea.style[style] = memoStyles[style];
  }
  var sendData = () => {
    browser.runtime.sendMessage({
      behavior: 'save_memo',
      url: location.href,
      memo_id: newTextarea.parentNode.dataset['pagememoId'],
      val: newTextarea.value,
      position: {
        x: newDiv.style.left,
        y: newDiv.style.top,
        width: newDiv.style.width
      }
    });
  };

  var ta_counter = 0;
  newTextarea.addEventListener('focusout', sendData);
  newTextarea.addEventListener('keypress', function(){
    ta_counter += 1;
    if (ta_counter % 10 != 0) return;
    sendData();
  });

  // holdbar
  var moving = false;
  var toggleMoving = () => {
    moving = !moving;
    if (moving) {
      newDiv.style.opacity = '1';
      newHoldbar.style.cursor = 'grabbing';
      newTextarea.style.cursor = 'grabbing';

      $width = newDiv.offsetWidth / 2;

      document.addEventListener('mousemove', e => {
        if (moving) {
          var x = e.clientX - $width;
          var y = e.clientY - document.querySelector('body').getBoundingClientRect().y;

          newDiv.style.left = x+'px';
          newDiv.style.top = y+'px';
          newDiv.style.right = undefined;
        };
      });
    }
    else {
      newHoldbar.style.cursor = 'grab';
      newTextarea.style.cursor = 'auto';
      sendData();
    }
  }

  newHoldbar.addEventListener('click', toggleMoving);
  newHoldbar.addEventListener('mouseover', () => {
    var hintSpan = document.createElement('SPAN');
    var newBtnText = document.createTextNode(browser.i18n.getMessage("moveHint"));
    hintSpan.appendChild(newBtnText);
    hintSpan.style.color = 'rgba(0,0,0,0.3)';
    newHoldbar.appendChild(hintSpan);
  });
  newHoldbar.addEventListener('mouseout', () => {
    newHoldbar.textContent = '';
  });

  var holdbarStyles = {
    'cursor': 'grab',
    'position': 'absolute',
    'top': '0',
    'left': '0',
    'width': '100%',
    'height': '18px',
    'textAlign': 'center',
    'background': 'transparent linear-gradient(rgba(0, 0, 0, 0.1), transparent) repeat scroll 0% 0%'
  };
  for( var style in holdbarStyles) {
    newHoldbar.style[style] = holdbarStyles[style];
  }

  // btn
  newBtn.addEventListener('click', () => {
    newBtn.parentNode.remove();
    browser.runtime.sendMessage({
      behavior: 'del_memo',
      url: location.href,
      memo_id: newBtn.parentNode.dataset['pagememoId']
    });
  });
  var btnStyles = {
    'color': '#343434',
    'cursor': 'pointer',
    'float': 'right',
    'right': '0',
    'position': 'absolute',
    'padding': '3px 5px',
    'textDecoration': 'none'
  };
  for( var style in btnStyles) {
    newBtn.style[style] = btnStyles[style];
  }
  newBtn.addEventListener('mouseover', () => {
    newBtn.style.color = '#aaa';
  });
  newBtn.addEventListener('mouseout', () => {
    newBtn.style.color = '#343434';
  });

  newBtn.appendChild(newBtnText);
  newDiv.appendChild(newHoldbar);
  newDiv.appendChild(newBtn);
  newDiv.appendChild(newTextarea);
  document.body.appendChild(newDiv);

  newTextarea.focus();
};

document.addEventListener('contextmenu', e => {
  browser.runtime.sendMessage({
    behavior: 'record_mouse_position',
    x: e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
    pageWidth: document.body.clientWidth
  }).then( res => {
    createMemo({
      x: res.x,
      y: e.clientY + document.body.scrollTop + document.documentElement.scrollTop
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
      createMemo({
        x: memo.position.x,
        y: memo.position.y,
        val: memo.val,
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
