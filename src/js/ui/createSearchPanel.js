export default function createSearchPanel(datatable) {
  let searchBar = document.createElement('div');
  searchBar.id = datatable._targetId + '-search-bar';
  searchBar.classList.add('search-bar-wrapper');

  let sb = searchBar.appendChild(document.createElement('input'));
  sb.type = 'search';
  sb.id = datatable._targetId + '-search-box';
  sb.classList.add('search-box');
  sb.setAttribute('aria-label', 'search box');
  sb.addEventListener('focus', function () {
    this.parentElement.classList.remove('search-hints-active');
  });

  let lb = searchBar.appendChild(document.createElement('label'));
  lb.htmlFor = sb.id;
  lb.classList.add('label-for-search-box');
  lb.setAttribute('role', 'button');
  lb.setAttribute('aria-label', 'search button');
  lb.appendChild(document.createTextNode('Search'));

  let sp = searchBar.appendChild(document.createElement('span'));
  sp.classList.add('question-mark');
  sp.setAttribute('role', 'button');
  sp.setAttribute('aria-label', 'hints for search syntax');
  sp.addEventListener('click', function () {
    this.parentElement.classList.add('search-hints-active');
  });

  let hintWrapper = searchBar.appendChild(document.createElement('div'));
  hintWrapper.classList.add('search-hints-wrapper');
  hintWrapper.setAttribute('role', 'table');
  let hint = hintWrapper.appendChild(document.createElement('p'));
  hint.innerText = `Syntax: "column name":[[operator] value] [AND | OR] ["column name"[:[operator]value]]`;
  hint.setAttribute('role', 'row');
  let example = hintWrapper.appendChild(document.createElement('p'));
  example.appendChild(document.createTextNode('e.g. '));
  example.appendChild(document.createElement('span')).appendChild(document.createTextNode('"length": > 120'));
  example.appendChild(document.createElement('span')).appendChild(document.createTextNode(';'));
  example.appendChild(document.createElement('span')).appendChild(document.createTextNode('"height": 80 AND "width": 100'));
  example.setAttribute('role', 'row');

  return searchBar;
}