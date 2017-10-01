window.onload = () => {

  var hackForStorage = obj => {
    // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/StorageArea/get#Return_value
    if ((typeof obj.length === 'number') && (obj.length > 0)) {
        obj = obj[0];
    }
  };

  browser.storage.local.get().then(data => {
    hackForStorage(data);

    var $memo_list = document.querySelector('#memo-list');

    for (var url in data) {
      var contents = data[url];
      for (var id in contents) {
        var url = url;
        var content = contents[id];

        var $tr = document.createElement("TR");
        var $td_url = document.createElement("TD");
        var $td_content = document.createElement("TD");

        $memo_list.append($tr);
        $tr.append($td_url);
        $tr.append($td_content);

        $tr.dataset.url = url;
        $td_url.textContent = url;
        $td_content.textContent = content.val;

        $tr.addEventListener('click', event => {
          var target = event.target;
          if (!target.dataset.url) target = target.parentElement;
          browser.tabs.create({url: target.dataset.url });
        });
      }
    }
  });
};

