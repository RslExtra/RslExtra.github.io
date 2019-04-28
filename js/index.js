/* eslint-disable func-names */
const libmenu = {};
const state = {};

function findAncestor(el, cls) {
  while ((el = el.parentElement) && !el.classList.contains(cls));
  return el;
}


function findAncestorOrIt(el, cls) {
  if (el.classList.contains(cls)) return el;
  return findAncestor(el, cls);
}

function getRelativePath(url) {
  const el = document.querySelector('#relative-path');
  if (!el) throw Error('Отсутствует #relative-path');
  const prefix = el.getAttribute('value');
  return prefix + url;
}

function closeAllMenuItems() {
  libmenu.items.forEach((el) => {
    if (el.classList.contains('open')) {
      el.classList.remove('open');
      el.classList.add('close');
    }
  });
}

function linkLibMenu() {
  libmenu.menu = document.querySelector('.lib-menu');
  if (!libmenu.menu) return;
  libmenu.items = libmenu.menu.querySelectorAll('.lib-menu-item');
  closeAllMenuItems();

  libmenu.items.forEach((el) => {
    const toggler = el.querySelector('.lib-menu-item-head > .toggler');
    if (toggler) {
      toggler.addEventListener('click', (e) => {
        const p = findAncestor(e.target, 'lib-menu-item');
        if (p.classList.contains('close')) {
          p.classList.remove('close');
          p.classList.add('open');
        } else if (p.classList.contains('open')) {
          p.classList.remove('open');
          p.classList.add('close');
        }
      });
    }
  });

  libmenu.rolup = document.querySelector('.rolup');
  libmenu.rolup.addEventListener('click', closeAllMenuItems);
}

function clickOnDeclaration(el) {
  if (el.target.tagName === 'A') {
    el.target.click();
  }
  const decl = findAncestor(el.target, 'declaration');
  const link = decl.querySelector('a');
  if (link) {
    link.click();
  }
}


function linkDeclarations() {
  const decls = document.querySelectorAll('.declaration');
  if (!decls) return;
  decls.forEach((el) => {
    el.addEventListener('click', clickOnDeclaration);
  });
}


function linkImportAndDependLists() {
  const importSection = document.querySelector('.import-section');
  if (importSection) {
    const importHeader = document.querySelector('.import-header');
    if (importHeader) {
      importHeader.addEventListener('click', () => {
        if (importSection.classList.contains('close')) {
          importSection.classList.remove('close');
        } else {
          importSection.classList.add('close');
        }
      });
    }
  }

  const dependSection = document.querySelector('.depend-section');
  if (importSection) {
    const dependHeader = document.querySelector('.depend-header');
    if (dependHeader) {
      dependHeader.addEventListener('click', () => {
        if (dependSection.classList.contains('close')) {
          dependSection.classList.remove('close');
        } else {
          dependSection.classList.add('close');
        }
      });
    }
  }
}

function addSearchPanel() {
  const relimg = getRelativePath('images/cancel_grey.png');
  const markup = ` 
   <div class="search-panel hide">
      <div class="search-panel-content">
         <div class="search-panel-control">
            <div class="search__form" method="POST">
                  <input class="search__field" autocomplete="off" autocorrect="off" placeholder="Search" role="textbox"
                     spellcheck="false" type="text" autofocus></input>
                  <div class="search__exit">
                     <img class="exit_img" src="${relimg}" alt="Esc."></img>
                  </div>
            </div>
         </div>
         <div class="search-panel__results">
         </div>
      </div>
   </div>
   `;
  const sb = document.querySelector('#docs__content');
  if (sb) {
    sb.insertAdjacentHTML('beforeend', markup);
  }
}

const loadOneModule = function (path) {
  const promise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = path;
    script.onload = resolve;
    script.onreadystatechange = resolve;
    document.body.appendChild(script);
  });
  return promise;
};


const loadSearchModules = async function () {
  await loadOneModule(getRelativePath('js/lunr.js'));
  await loadOneModule(getRelativePath('js/lunr.stemmer.support.js'));
  await loadOneModule(getRelativePath('js/lunr.ru.js'));
  await loadOneModule(getRelativePath('js/lunr.multi.js'));
  await loadOneModule(getRelativePath('js/search.js'));
};
/*
const loadModule = function (path, type = 'module') {
  return new Promise(((resolve, reject) => {
    const script = document.createElement('script');
    script.onload = resolve;
    script.src = path;
    script.type = type;
    document.head.appendChild(script);
  }));
};
*/

const searchBtnListener = function () {
  let searchPan = document.querySelector('.search-panel');
  if (!searchPan) {
    addSearchPanel();
    searchPan = document.querySelector('.search-panel');
  }
  loadSearchModules().then(() => {
    const searchbtn = document.querySelector('.search-button');
    if (searchPan.classList.contains('hide')) {
      searchPan.classList.remove('hide');
    }
    if (searchbtn) {
      searchbtn.removeEventListener('click', searchBtnListener);
      // eslint-disable-next-line no-undef
      onSearchPageLoad();
    }
  });
};

function linkSearch() {
  const searchbtn = document.querySelector('.search-button');
  if (searchbtn) {
    searchbtn.addEventListener('click', searchBtnListener);
  }
}

function updateTagItems() {
  const tagBtns = document.querySelectorAll('.tag-item');

  if (tagBtns) {
    const onTags = Array();
    tagBtns.forEach((btn) => {
      if (btn.classList.contains('tagon')) {
        onTags.push(btn.getAttribute('tgname'));
      }
    });

    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach((it) => {
      const tagMarks = Array();
      const tagMarkNodes = it.querySelectorAll('.tag-mark');
      if (tagMarkNodes.length === 0) {
        tagMarks.push('__t0');
      } else {
        tagMarkNodes.forEach((nd) => {
          tagMarks.push(nd.classList[1]);
        });
      }
      let showit = false;
      for (let i = 0; i < tagMarks.length; i++) {
        if (onTags.indexOf(tagMarks[i]) >= 0) {
          showit = true;
          break;
        }
      }
      if (showit) {
        if (it.classList.contains('hide')) {
          it.classList.remove('hide');
        }
      } else if (!it.classList.contains('hide')) {
        it.classList.add('hide');
      }
    });
  }
}


function linkTagButtons() {
  const tagBtns = document.querySelectorAll('.tag-item');
  if (tagBtns) {
    tagBtns.forEach((btn) => {
      btn.addEventListener('click', (el) => {
        const bt = findAncestorOrIt(el.target, 'tag-item');
        if (bt.classList.contains('tagoff')) {
          bt.classList.remove('tagoff');
          bt.classList.add('tagon');
        } else {
          bt.classList.add('tagoff');
          bt.classList.remove('tagon');
        }
        updateTagItems();
      });
    });
  }
}

async function showPopup(popup, accent, timemillis) {
  if (!popup.classList.contains('active')) {
    popup.classList.add('active');
  }

  if (!accent.classList.contains('clicked')) {
    accent.classList.add('clicked');
  }

  setTimeout((pu, ac) => {
    if (pu.classList.contains('active')) {
      pu.classList.remove('active');
    }
    if (ac.classList.contains('clicked')) {
      ac.classList.remove('clicked');
    }
  }, timemillis, popup, accent);
}

function linkCopyButtons() {
  const samples = document.querySelectorAll('.sample>.code-container>.code-accent');
  samples.forEach((s) => {
    s.addEventListener('click', (el) => {
      const cont = findAncestor(el.target, 'sample');
      const fullLine = cont.querySelector('.code-lines-full');
      const txt = fullLine.querySelector('code');

      if (window.getSelection) {
        if (window.getSelection().empty) { // Chrome
          window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) { // Firefox
          window.getSelection().removeAllRanges();
        }
      } else if (document.selection) { // IE?
        document.selection.empty();
      }

      if (document.selection) {
        const range = document.body.createTextRange();
        range.moveToElementText(txt);
        range.select().createTextRange();
      } else if (window.getSelection) {
        const range = document.createRange();
        range.selectNode(txt);
        window.getSelection().addRange(range);
      }

      try {
        const wasHide = fullLine.classList.contains('hide');
        if (wasHide) {
          fullLine.classList.remove('hide');
        }
        const succ = document.execCommand('copy');
        if (wasHide) {
          fullLine.classList.add('hide');
        }
        const popup = cont.querySelector('.popup');
        showPopup(popup, s, 2000);
      } catch (error) {
        console.log('Unable to copy');
      }
      window.getSelection().removeAllRanges();
    });
  });
}

function linkHideCodeButtons() {
  const hideBtns = document.querySelectorAll('.code-hider');
  if (!hideBtns || hideBtns.length === 0) return;
  hideBtns.forEach((b) => {
    b.addEventListener('click', (el) => {
      const cont = findAncestor(el.target, 'sample');
      const hider = findAncestor(el.target, 'code-hider');
      const p = hider.querySelector('p');

      const isHide = (p.innerHTML === '+');
      const fulltext = cont.querySelector('.code-lines-full');
      const shorttext = cont.querySelector('.code-lines-short');

      if (isHide) {
        p.innerHTML = 'x';
        fulltext.classList.remove('hide');
        shorttext.classList.add('hide');
      } else {
        p.innerHTML = '+';
        fulltext.classList.add('hide');
        shorttext.classList.remove('hide');
      }
    });
  });
}

// Привяжем визуальные фишечки
function onPageLoad() {
  linkLibMenu();
  linkDeclarations();
  linkImportAndDependLists();
  linkTagButtons();
  linkHideCodeButtons();
  linkCopyButtons();
  linkSearch();
}

onPageLoad();
