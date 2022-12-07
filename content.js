console.log("Content script running...");

function clear() {
    const contents = document.querySelectorAll('p,li,span,h1,h2,h3,h4,h5,h6');
    for(const snippet of contents){
        snippet.style.backgroundColor = "initial";
    }

}

function findText(find, results){
    find = find.toLowerCase();
    chrome.storage.local.set({output:"undefined"});
    const key = "?key=fb9962e8-8321-4ec5-8b85-d23c0bf80d5b";
    const url = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/" + find + key;
    console.log(url);
    fetch(url)
    .then(response =>{
      if (!response.ok) {
        console.log("error");
      }
      return response.json();
    })
    .then(data =>{
      var syns = [];
      syns.push(find);
      var flag = true;
      if (!data[0].meta) {
        console.log("not a real word");
        flag = false;
      }
      if(flag) {
        for (var i =0; i < data.length; i++) {
          if (data[i].meta.id.normalize() === find.normalize()) {
            for (var j = 0; j < data[i].meta.syns.length; j++) {
              syns = syns.concat(data[i].meta.syns[j])
            }
          }
        }
      }
      console.log(syns);
      helper(syns);
    });


}

function helper(syns) {
  clear();
  const contents = document.querySelectorAll('p,li,span,h1,h2,h3,h4,h5,h6');

  console.log("in script");

  outputArray = [];
  for (const find of syns) {
    for(const snippet of contents){
        if(snippet.textContent.toLowerCase().includes(find.toLowerCase())){
            snippet.style.backgroundColor = "red";
            for (const sen of snippet.textContent.split(".")) {
                if(sen.toLowerCase().includes(find.toLowerCase())){
                    outputArray.push(sen);
                    console.log(sen);
                }
            }
        }
    }
  }
  outputText = "";
  outputText = outputText.concat("<p>");
  outputText = outputText.concat(outputArray.length);
  outputText = outputText.concat(" results</p>");
  for(elem of outputArray){
      outputText = outputText.concat("<li>");
      outputText = outputText.concat(elem);
      outputText = outputText.concat("</li>");
  }
  console.log(outputText);
  chrome.storage.local.set({output:outputText});
}

chrome.runtime.onMessage.addListener(function(message){
    if(message.action === 'FIND_TEXT'){
        findText(message.find, message.results);
    }
});

