document.addEventListener('mouseup',function(event)
{
  var text = window.getSelection().toString();

  //debugger;
  console.log(text);

  if(text.length) {
    chrome.extension.sendRequest({'message':'setText','text': text},function(response){})
  }
});
