const VERIFY_STR = 'THIS-FILE-IS-MADE-BY-PAGEMEMO';

window.addEventListener('load', () => {
  var $modal = document.querySelector('#action-modal')
  var $export = document.querySelector('#export');
  var $import = document.querySelector('#import');

  $export.addEventListener('click', () => {
    $modal.classList.add('show');
    $modal.querySelector('#export-content').classList.add('show');
    $modal.querySelector('#import-content').classList.remove('show');

    browser.storage.local.get().then( data => {
      data.verify = VERIFY_STR;

      var jsonData = JSON.stringify(data);
      var date_str = (new Date).toLocaleDateString('en').replace(/\//g,'-');

      // FIXME: filename not work
      var fileName = `pageMemo.${date_str}.json`;
      var a = document.createElement("a");
      a.href = "data:application/text," + encodeURIComponent(jsonData);
      a.target = "_blank";
      a.textContent = "click me to export your memos";
      a.download = fileName;
      $modal.querySelector('#export-content').append(a);
      a.click();
    })
  })

  $import.addEventListener('click', () => {
    $modal.classList.add('show');
    $modal.querySelector('#export-content').classList.remove('show');

    var $content = $modal.querySelector('#import-content');
    $content.classList.add('show');
    $content.classList.remove('done');

    var $src = $content.querySelector('#import-src');
    $src.onchange = function(){
      var file = this.files[0];

      var fr = new FileReader();
      fr.onload = function(){
        var txt = this.result;

        try {
          var importData = JSON.parse(txt);
          if (!importData.verify || importData.verify !== VERIFY_STR) {
            alert('Your file is not valid.')
            $src.value = "";
          }
          else {
            delete importData.verify;
            var $confirm_btn = $content.querySelector('#modal-confirm');
            $confirm_btn.removeAttribute('disabled');
            $confirm_btn.onclick = async () => {
              const confirm_msg = 'Your current data will be overwrited, do you really want to import?';
              if (!confirm(confirm_msg)) return;
              await browser.storage.local.clear();
              await browser.storage.local.set(importData);
              $content.classList.add('done');

              window.setTimeout(() => {
                $src.value = "";
                $modal.querySelector('.close-btn').click();
              }, 3000)
            };
          }
        }
        catch(err){
          alert('Your file is not valid.')
          $src.value = "";
        }

      };
      fr.readAsText(file);
    };
  })

  $modal.querySelector('.close-btn').addEventListener('click', () => {
    $modal.classList.remove('show')
  })
})
