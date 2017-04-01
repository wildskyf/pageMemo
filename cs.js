document.addEventListener('contextmenu', e => {
  browser.runtime.sendMessage({
    x: e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
    pageWidth: document.body.clientWidth
  }).then( res => {
    var x = res.x, isRight = res.isRight;
    var y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    var newDiv = document.createElement('div');
    var newTextarea = document.createElement('textarea');
    var newBtn = document.createElement('a');
    var newBtnText = document.createTextNode('X');

    // div
    newDiv.classList.add('pageMemo');
    newDiv.style.position = 'absolute';
    newDiv.style.top = y + 'px';
    if (isRight)
      newDiv.style.right = x + 'px';
    else
      newDiv.style.left = x + 'px';

    // textarea
    newTextarea.rows = "7";
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

    // btn
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
  });
});

