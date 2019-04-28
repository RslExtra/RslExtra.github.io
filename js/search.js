
var elements = {
   searchForm: document.querySelector('.search__form'),
   searchInput: document.querySelector('.search__field'),
   searchBtn: document.querySelector('#search__btn'),
   searchPanel: document.querySelector(".search-panel"),
   searchPanelExit: document.querySelector(".search__exit"),
   searchResults: document.querySelector('.search-panel__results')   
};


var searchView = function (){
   var activeResult = 0;

   var formatArticle = function (text, searchword, maxSize) {
      if(!searchword) searchword = '';
      let part = text;
      const lwrSearch = searchword.toLowerCase();    
      let lwrText = text.toLowerCase();
      let pos = lwrText.indexOf(lwrSearch);
      let from = 0;
      if(pos >= 0){       
          from = text.lastIndexOf('.', pos) + 1;  
      } 
      part = text.substr(from, maxSize);
      lwrText = part.toLowerCase(); 
      if(part.length < (text.length - from - 1)){
          part = part + "...";
      }
      let res = '';
      let lastpos = 0;
      const len = searchword.length;
      while(pos >= 0){
          pos = lwrText.indexOf(lwrSearch, lastpos);
          if(pos >= 0){
              res += part.substring(lastpos, pos);
              res += '<em>' + part.substr(pos, len) + '</em>';
              lastpos = pos + len;
          } 
      }
      res += part.substring(lastpos);    
      return res;  
   };

   var formatPath = function (text, searchword) {
      return formatArticle(text, searchword, 80);
   };

   var formatBody = function (text, searchword) {
      return formatArticle(text, searchword, 240);
   };

   var renderResult = function (result, query) {
      const markup = `
      <div class="result-item" id="${result.id}" >
          <div class="result-libname">${result.lib}</div>
          <div class="result-more">
              <div class="result-path">${formatPath(result.path, query)}</div>
              <div class="result-description"><p>${formatBody(result.body, query)}</p></div>        
          </div>
      </div>
      `;
      elements.searchResults.insertAdjacentHTML('beforeend', markup);  
   }

   var activateOneResult = function (num) {
      activeResult += num;
      const results = document.querySelectorAll(".result-item");
      if(activeResult < 0) {
         activeResult = 0;
         return;
      }else if(activeResult >= results.length) {
         activeResult = 0;
      }      

      for(var i = 0; i<results.length; i++) {
         results[i].classList.remove('active');
      }
      if (results[activeResult]){
         results[activeResult].classList.add('active');    
      } 
      
   };

   return { 
      getInput: function() {
         return elements.searchInput.value;   
      },

      clearResults: function() {
         elements.searchResults.innerHTML = "";
      },

      activateResult: function (num) {
         activateOneResult(num);
      },

      renderResults: function (results, query) {         
         results.slice(0, 10).forEach(el => renderResult(el, query));
         activeResult = 0;
         if(results.length>0) activateOneResult(0);   
      }
   }
}();


function fetchSearchData() {
   return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      var path = getRelativePath('js/searchdata.json');
      xhr.open('GET', path, true);
      xhr.onload = function () {
         if (this.status >= 200 && this.status < 300) {
            resolve(xhr.response);
         } else {
            reject({
               status: this.status,
               statustext: xhr.statusText
            });
         }
      };
      xhr.send(null);
   });
};

function onPageLoadSearch () {
   
}


function searchBtnReady(){   

   elements.searchBtn.addEventListener('click', (e) => {
      elements.searchPanel.classList.remove('hide');
      elements.searchInput.focus();
   })
}

async function loadIndexedFile(){
   return null;
}

async function loadSearchFile() {
   try {
      let response = await fetchSearchData();
      //console.log(response);
      let sdata = JSON.parse(response);
      return sdata;
   } catch (error) {

   }
};

async function createIndexFile(index) {
   
   let serializedIdx = JSON.stringify(index);   
   const a = document.createElement('a');
   const file = new Blob([serializedIdx], {type: 'text/plain'});
   a.href = URL.createObjectURL(file);
   a.download = 'serializeIndex.json';
   a.click();
}

async function getIndex() {
   if (!state.index) {
      let needIndex = false;
      let sdata = await loadIndexedFile();
      if(!sdata) {
         sdata = await loadSearchFile();
         needIndex = true;
      }      
      searchBtnReady();
/*
      state.index = elasticlunr(function () {
         this.pipeline.remove(lunr.stemmer);
         this.pipeline.remove(lunr.stopWordFilter);
         //this.clearStopWords();
         this.setRef('id');
         this.addField('path');
         this.addField('body');

         let store = new Array();
         sdata.forEach(el => {
            store[parseInt(el.id)] = el;     
            this.addDoc(el);
         });

         state.store = store;
      }

      );
      */

      state.index = lunr(function () {
         this.use(lunr.multiLanguage('en', 'ru'));

         //this.use(lunr.en);
         this.pipeline.remove(lunr.stemmer);
         this.pipeline.remove(lunr.stopWordFilter);

         this.ref('id');
         this.field('path');
         this.field('body');

         let store = new Array();
         sdata.forEach(el => {
            store[parseInt(el.id)] = el;     
            this.add(el);
         });

         state.store = store;
         //console.log(state);
         if(needIndex) {
           // createIndexFile(this);
         }
      });
      
   }
   return state.index;
}

async function qSearch(index ,query) { 
   /*
   const r = index.search(query, {
      fields: {
         path: {boost: 10},
         body: {boost: 1}
      },
      bool: "OR"
   });
   return r;
   */
   
   const r = index.query( q => {
      lunr.tokenizer(query).forEach( t => {
         q.term(t.toString(), { fields: ['path'], boost: 100});
         q.term(t.toString(), { fields: ['body']});        
      });     
   });
 
   return r;
}

async function searchResults(querystr, from, to) {
   const index = await getIndex();
   let query = querystr.trim();
   //const qres = await index.search(query + "*");
   const qres = await qSearch(index, query + '*');
   console
   const res = new Array();  
   qres.forEach(el => {
      res.push(state.store[parseInt(el.ref)])
   });
   return res;
}

function findAncestor (el, cls) {
   if(el.classList.contains(cls)) return el;
   while ((el = el.parentElement) && !el.classList.contains(cls));
   return el;
}

function getRelativePath(url){
   const el = document.querySelector("#relative-path");
   if(!el) throw Error("Отсутствует #relative-path");
   const prefix = el.getAttribute("value");
   return prefix + url;
}

function addEventListeners(results){
   const divs = document.querySelectorAll('.result-item');
   if(!divs) return; 
   divs.forEach(el => {
      el.addEventListener('click', function(e) {
         const d = findAncestor(e.target, 'result-item');
         const sh = state.store[parseInt(d.id)];
         const url = getRelativePath(sh.url);         
         window.open(url);
      });
   });  
}

async function search(query) {  
   searchView.clearResults();
   const results = await searchResults(query);  
   state.searchResults = results;
   if (results.length > 0) {    
      searchView.renderResults(results, query);
      addEventListeners(results);
   }
}


async function main() {
   const res = await search("Coll");
   //console.log(res);
}


var onSearchPageLoad = function(){
   
   elements.searchInput.onkeyup = function() {    
      var query = searchView.getInput().trim();
      if(query.length >= 3) {
         if(!state.oldQuery) state.oldQuery = '';
         if(query!=state.oldQuery) {       
            search(query);
            state.oldQuery = query;
         }
      } else {
         searchView.clearResults();
      }
   }
   searchBtnReady();
   state.oldQuery = '';
   elements.searchPanelExit.addEventListener('click', e => {
      elements.searchPanel.classList.add('hide');
   });

   elements.searchInput.addEventListener('keydown', e => {
      if((e.keyCode == 38) || (e.keyCode == 40)) {        
         e.preventDefault();  
      }
   })

   document.addEventListener('keydown', e => {    
      if(!elements.searchPanel.classList.contains('hide')) {
         if(e.keyCode == 27){
            elements.searchPanel.classList.add('hide');
         } else if (e.keyCode == 38) {  // Up
            searchView.activateResult(-1);   
         } else if (e.keyCode == 40) { // Down 
                    
            searchView.activateResult(1);            
         } else if (e.keyCode == 13) {  // Enter
            const actresult = document.querySelector(".result-item.active");
            
            if(actresult){
               const sh = state.store[parseInt(actresult.id)];
               const url = getRelativePath(sh.url); 
               window.open(url);
            }
         }
      } else  {
         

      }

   });
   elements.searchBtn.click();
};


//console.log(qSearch('TArray'));
