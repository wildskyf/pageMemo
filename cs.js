var createMemo = info => {
  var {x,y,isRight} = info;
  var val = info.val;

  var newDiv = document.createElement('div');
  var newTextarea = document.createElement('textarea');
  var newBtn = document.createElement('a');
  var newBtnText = document.createTextNode('X');

  // div
  newDiv.classList.add('pageMemo');
  newDiv.dataset['pagememoId'] = document.querySelectorAll('.pageMemo').length; // start from 0
  newDiv.style.position = 'absolute';
  newDiv.style.top = parseInt(y) + 'px';
  if (isRight)
    newDiv.style.right = parseInt(x) + 'px';
  else
    newDiv.style.left = parseInt(x) + 'px';

  // textarea
  newTextarea.rows = "7";
  if (val) newTextarea.value = val;
  var memoStyles = {
    'background': 'lightyellow',
    'outline':    'none',
    'border':     '1px solid #999',
    'padding':    '1em',
    'boxShadow': '1px 1px 5px rgba(0,0,0,0.2)'
  };
  for( var style in memoStyles) {
    newTextarea.style[style] = memoStyles[style];
  }
  var sendData = () => {
    browser.runtime.sendMessage({
      behavior: 'save_memo',
      url: location.host + location.pathname,
      memo_id: newTextarea.parentNode.dataset['pagememoId'],
      val: newTextarea.value,
      position: {
        x: newDiv.style.left || newDiv.style.right,
        y: newDiv.style.top,
        isRight: !!newDiv.style.right,
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

  // btn
  newBtn.addEventListener('click', () => {
    newBtn.parentNode.remove();
    browser.runtime.sendMessage({
      behavior: 'del_memo',
      url: location.host + location.pathname,
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
      isRight: res.isRight,
      y: e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    });
  });
});

browser.runtime.sendMessage({
  behavior: 'init',
  url: location.host + location.pathname
}).then( memos => {
  if (memos) {
    for (var key in memos) {
      var memo = memos[key];
      console.log(memo);
      createMemo({
        x: memo.position.x,
        isRight: memo.position.isRight,
        y: memo.position.y,
        val: memo.val
      });
    }
  }
});

