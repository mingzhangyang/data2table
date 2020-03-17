"use strict";function asyncGeneratorStep(e,t,a,n,r,o,i){try{var l=e[o](i),c=l.value}catch(e){return void a(e)}l.done?t(c):Promise.resolve(c).then(n,r)}function _asyncToGenerator(l){return function(){var e=this,i=arguments;return new Promise(function(t,a){var n=l.apply(e,i);function r(e){asyncGeneratorStep(n,t,a,r,o,"next",e)}function o(e){asyncGeneratorStep(n,t,a,r,o,"throw",e)}r(void 0)})}}function _slicedToArray(e,t){return _arrayWithHoles(e)||_iterableToArrayLimit(e,t)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function _iterableToArrayLimit(e,t){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e)){var a=[],n=!0,r=!1,o=void 0;try{for(var i,l=e[Symbol.iterator]();!(n=(i=l.next()).done)&&(a.push(i.value),!t||a.length!==t);n=!0);}catch(e){r=!0,o=e}finally{try{n||null==l.return||l.return()}finally{if(r)throw o}}return a}}function _arrayWithHoles(e){if(Array.isArray(e))return e}function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var a=0;a<t.length;a++){var n=t[a];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function _createClass(e,t,a){return t&&_defineProperties(e.prototype,t),a&&_defineProperties(e,a),e}var DataTable=function(){var r=function(){function b(e){_classCallCheck(this,b),this.colModel={},this.allColumns=[];var t=new Set,a=!0,n=!1,r=void 0;try{for(var o,i=e[Symbol.iterator]();!(a=(o=i.next()).done);a=!0)for(var l=o.value,c=Object.keys(l),s=0,d=c;s<d.length;s++){var u=d[s];t.add(u)}}catch(e){n=!0,r=e}finally{try{a||null==i.return||i.return()}finally{if(n)throw r}}var m=!0,h=!1,f=void 0;try{for(var p,g=t[Symbol.iterator]();!(m=(p=g.next()).done);m=!0){var v=p.value;this.colModel[v]={name:v,label:v,tips:"",sortable:!1,hidden:!1,width:"",align:"",formatter:void 0},this.allColumns.push(v)}}catch(e){h=!0,f=e}finally{try{m||null==g.return||g.return()}finally{if(h)throw f}}this.shownColumns=this.allColumns.slice(),this.hiddenColumns=[]}return _createClass(b,[{key:"configureColumn",value:function(e,t){if(!this.colModel[e])throw new Error("Column name not recognized.");if("object"!==_typeof(t))throw new Error("An object describing the column expected.");if(Object.assign(this.colModel[e],t),this.colModel[e].hidden||!1===this.colModel[e].shown){var a=this.shownColumns.indexOf(e);-1!==a&&this.hiddenColumns.push(this.shownColumns.splice(a,1)[0])}}},{key:"setShownColumns",value:function(e){var t=[],a=!0,n=!1,r=void 0;try{for(var o,i=e[Symbol.iterator]();!(a=(o=i.next()).done);a=!0){var l=o.value;if(!this.allColumns.includes(l))throw"invalid column name found when set shown columns";t.push(l)}}catch(e){n=!0,r=e}finally{try{a||null==i.return||i.return()}finally{if(n)throw r}}this.shownColumns=t,this.hiddenColumns=this.allColumns.filter(function(e){return!t.includes(e)})}}]),b}();function d(e,t){var a=new Map,n=!0,r=!1,o=void 0;try{for(var i,l=e[Symbol.iterator]();!(n=(i=l.next()).done);n=!0){var c=i.value[t];"object"===_typeof(c)&&(c=c.valueForFaceting);var s=a.get(c);void 0===s?a.set(c,1):a.set(c,s+1)}}catch(e){r=!0,o=e}finally{try{n||null==l.return||l.return()}finally{if(r)throw o}}var d=[],u=!0,m=!1,h=void 0;try{for(var f,p=a[Symbol.iterator]();!(u=(f=p.next()).done);u=!0){var g=_slicedToArray(f.value,2),v=g[0],b=g[1];d.push({facetType:"value",facetValue:v,count:b})}}catch(e){m=!0,h=e}finally{try{u||null==p.return||p.return()}finally{if(m)throw h}}return d.sort(function(e,t){return e.count>t.count?-1:e.count<t.count?1:e.facetValue>t.facetValue?-1:1}),d}function h(e,t){var a=[],n=!0,r=!1,o=void 0;try{for(var i,l=t[Symbol.iterator]();!(n=(i=l.next()).done);n=!0){var c=i.value,s={name:c};s.facets=d(e,c),a.push(s)}}catch(e){r=!0,o=e}finally{try{n||null==l.return||l.return()}finally{if(r)throw o}}return a}function f(e,t){if(e===t)return!0;if(Object.prototype.toString.call(e)!==Object.prototype.toString.call(t))return!1;var a=Object.keys(e),n=Object.keys(t);if(a.length!==n.length)return!1;for(var r=0,o=a;r<o.length;r++){var i=o[r],l=e[i],c=t[i];if(Object.prototype.toString.call(l)!==Object.prototype.toString.call(c))return!1;if("object"===_typeof(l)){if(!f(l,c))return!1}else if(l!==c)return!1}return!0}var s=200,u=[1e3,800,600,400,s],o=function(){function c(e,t){if(_classCallCheck(this,c),!Array.isArray(e))throw new TypeError("an array of objects expected");if("[object Object]"!==Object.prototype.toString.call(e[0]))throw new TypeError("an array of objects expected");if(this.dataIsComplete=t.dataIsComplete,this.dataIsComplete)this.data=e,this.batchSize=e.length,this.cache={data:this.data.slice(),queryObject:{filter:{},sort:{}},range:[0,this.batchSize],totalCount:e.length},this.fetchData=function(e){var t=e.start,a=e.limit,n=e.filter,r=e.sort,o=this.data.slice();if(n)for(var i=Object.keys(n),l=function(){var t=s[c];o=Array.isArray(n[t])?o.filter(function(e){return"object"===_typeof(e[t])?n[t].includes(e[t].valueForFiltering):n[t].includes(e[t])}):o.filter(function(e){return"object"===_typeof(e[t])?n[t]===e[t].valueForFiltering:n[t]===e[t]})},c=0,s=i;c<s.length;c++)l();if(r){var d=Object.keys(r)[0],u=r[d];1===u?o.sort(function(e,t){return"object"===_typeof(e[d])&&"object"===_typeof(t[d])?e[d].valueForSorting<t[d].valueForSorting?-1:1:e[d]<t[d]?-1:1}):-1===u&&o.sort(function(e,t){return"object"===_typeof(e[d])&&"object"===_typeof(t[d])?e[d].valueForSorting<t[d].valueForSorting?1:-1:e[d]<t[d]?1:-1})}return{data:o.slice(t,t+a),totalCount:o.length}}.bind(this);else{if(e.length<s)throw"dataIsComplete is set false, but the provided dataset contains less than ".concat(s," rows");var a=!0,n=!1,r=void 0;try{for(var o,i=u[Symbol.iterator]();!(a=(o=i.next()).done);a=!0){var l=o.value;if(e.length>=l){this.data=e.slice(0,l),this.batchSize=l,this.cache={data:this.data.slice(),queryObject:{filter:{},sort:{}},range:[0,this.batchSize]};break}}}catch(e){n=!0,r=e}finally{try{a||null==i.return||i.return()}finally{if(n)throw r}}if(!t.fetchData)throw"data is not complete, a fetchData function is required";if("function"!=typeof t.fetchData)throw new TypeError("fetchData should be a function");if(!t.totalCount)throw"data is not complete, a totalCount property indicating total rows is missing";this.fetchData=t.fetchData,this.cache.totalCount=t.totalCount}}var t;return _createClass(c,[{key:"serve",value:(t=_asyncToGenerator(regeneratorRuntime.mark(function e(n){var r,o,i,l,c,s,d,u,m;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(Array.isArray(n.facets))return e.abrupt("return",h(this.data,n.facets));e.next=2;break;case 2:if(r=n.start?n.start:0,o=n.limit?n.limit:10,i=n.filter?n.filter:{},l=n.sort?n.sort:{},t=n,a=this.cache.queryObject,f(t.sort,a.sort)&&f(t.filter,a.filter)&&r>=this.cache.range[0]&&r<this.cache.range[1])return c=r-this.cache.range[0],e.abrupt("return",{data:this.cache.data.slice(c,c+o),totalCount:this.cache.totalCount});e.next=9;break;case 9:return s=r-r%this.batchSize,d={start:s,limit:this.batchSize,filter:i,sort:l},u=null,e.prev=12,e.next=15,this.fetchData(d);case 15:u=e.sent,e.next=21;break;case 18:throw e.prev=18,e.t0=e.catch(12),e.t0;case 21:return this.cache.data=u.data,this.cache.queryObject=d,this.cache.range=[s,s+this.batchSize],this.cache.totalCount=u.totalCount,m=r-s,e.abrupt("return",{data:this.cache.data.slice(m,m+o),totalCount:u.totalCount});case 27:case"end":return e.stop()}var t,a},e,this,[[12,18]])})),function(e){return t.apply(this,arguments)})}]),c}(),i=function(){function e(){_classCallCheck(this,e),this.rowsPerPage=10,this.currentPageNumber=1,this.sort={},this.filter={},this.filterStatus={}}return _createClass(e,[{key:"extractFilter",value:function(){for(var e={},t=0,a=Object.keys(this.filterStatus);t<a.length;t++){var n=a[t],r=this.filterStatus[n].filter(function(e){return e.selected});0<r.length&&(e[n]=r.map(function(e){return e.facetValue}))}return this.filter=e}},{key:"getStart",value:function(){return(this.currentPageNumber-1)*this.rowsPerPage}},{key:"queryObject",value:function(){return{start:(this.currentPageNumber-1)*this.rowsPerPage,limit:this.rowsPerPage,filter:this.extractFilter(),sort:this.sort}}}]),e}(),t={highlight:function(e){return"<mark>".concat(e,"</mark>")},addLink:function(e){return'<a href="'.concat(e.link,'">').concat(e.text,"</a>")},bold:function(e){return"<strong>".concat(e,"</strong>")},colorText:function(e){return'<span style="color: '.concat(e.color,'">').concat(e.text,"</span>")}};function x(e){return t[e]}function T(e,t){var a=1<arguments.length&&void 0!==t?t:",";if(!Array.isArray(e))throw new TypeError("an array of objects expected");if(0===e.length)return"";var n=Object.keys(e[0]),r=n.map(function(e){return e.includes(a)?'"'.concat(e,'"'):e}).join(a)+"\n",o=!0,i=!1,l=void 0;try{for(var c,s=function(){var t=c.value,e=n.map(function(e){return t[e]});e=e.map(function(e){return e.includes(a)?'"'.concat(e,'"'):e}),r+=e.join(a)+"\n"},d=e[Symbol.iterator]();!(o=(c=d.next()).done);o=!0)s()}catch(e){i=!0,l=e}finally{try{o||null==d.return||d.return()}finally{if(i)throw l}}return r}function A(e){switch(_typeof(e)){case"number":return e+"";case"string":return e;case"boolean":return e+"";case"object":return Array.isArray(e)?e.join(", "):null===e?"N/A":JSON.stringify(e);default:return"N/A"}}function l(e,t,a){var n=!0,r=!1,o=void 0;try{for(var i,l=e._columnSetting.shownColumns[Symbol.iterator]();!(n=(i=l.next()).done);n=!0){var c=i.value;if(e._columnSetting.colModel[c].formatter)if("string"==typeof e._columnSetting.colModel[c].formatter){if(!x(e._columnSetting.colModel[c].formatter))throw new Error("formatter not recognized");e._columnSetting.colModel[c].formatter=x(e._columnSetting.colModel[c].formatter)}else if("function"!=typeof e._columnSetting.colModel[c].formatter)throw new Error("Invalid formatter for "+c)}}catch(e){r=!0,o=e}finally{try{n||null==l.return||l.return()}finally{if(r)throw o}}if("string"!=typeof e._targetId||!e._targetId)throw new Error("an element id expected");var s=document.getElementById(e._targetId+"-table-section");if(!s)throw new Error("failed to locate the table");var d=s.getElementsByTagName("tbody")[0];d._data=null,s.removeChild(d);var u=document.createDocumentFragment();(d=u.appendChild(document.createElement("tbody")))._data=t;for(var m=0;m<t.length;m++){var h=t[m],f=d.appendChild(document.createElement("tr"));switch(e._configuration.firstColumnType){case"number":var p=e._stateManager.getStart()+1,g=f.appendChild(document.createElement("td"));g.innerText=p+m,g.classList.add("table-row-index-column");break;case"checkbox":f.appendChild(document.createElement("td")).classList.add("table-row-index-column","table-row-checkbox-column")}var v=!0,b=!1,y=void 0;try{for(var C,_=e._columnSetting.shownColumns[Symbol.iterator]();!(v=(C=_.next()).done);v=!0){var w=C.value,E=f.appendChild(document.createElement("td"));if(e._columnSetting.colModel[w].formatter){var L=e._columnSetting.colModel[w].formatter(h[w]);switch(_typeof(L)){case"string":E.innerHTML=L;break;case"object":E.appendChild(L);break;default:E.innerText="invalid customized formatter"}}else E.innerText=A(h[w]);e._columnSetting.colModel[w].align&&(E.style.textAlign=e._columnSetting.colModel[w].align)}}catch(e){b=!0,y=e}finally{try{v||null==_.return||_.return()}finally{if(b)throw y}}}if(s.appendChild(u),e._configuration.pagination){var k=document.getElementById(e._targetId+"-table-page-number-current");k.value=e._stateManager.currentPageNumber,k.setAttribute("aria-label","current page is "+k.value);var S=document.getElementById(e._targetId+"-table-page-number-total");S.value=a,S.setAttribute("aria-label","all ".concat(a," pages"))}}function m(e){var t=document.getElementById(e._targetId+"-filter-section");if(!t)throw new Error("Creating filter section failed.");for(;t.lastChild;)t.removeChild(t.lastChild);var a=Object.keys(e._stateManager.filterStatus);if(0!==a.length){var n=document.getElementById(e._targetId+"-filter-viz-download-buttons-wrapper");if(0===n.getElementsByClassName("filter-section-control-button").length){var r=n.insertBefore(document.createElement("div"),n.firstElementChild);r.classList.add("table-top-button","filter-section-control-button"),r.appendChild(document.createTextNode("Filters")),r.setAttribute("role","button"),r.setAttribute("aria-label","filter button"),r.addEventListener("click",function(){document.getElementById(e._targetId).classList.toggle("filter-section-active")}),r.classList.add("filter-ready-signal"),setTimeout(function(){r.classList.remove("filter-ready-signal")},2e3)}var o=document.createDocumentFragment(),i=o.appendChild(document.createElement("table"));i.classList.add("filter-section-table");for(var l=0,c=a;l<c.length;l++){var s=c[l],d=i.appendChild(document.createElement("tr"));d.classList.add("filter-section-row"),d.filterName=s;var u=d.appendChild(document.createElement("td"));u.classList.add("filter-name"),u.appendChild(document.createTextNode(e._columnSetting.colModel[s].label?e._columnSetting.colModel[s].label:s)),(u=d.appendChild(document.createElement("td"))).classList.add("filter-values"),u.classList.add("unfold-fold-fold");for(var m=0;m<e._stateManager.filterStatus[s].length;m++){var h=e._stateManager.filterStatus[s][m],f=u.appendChild(document.createElement("span"));f.classList.add("filter-value"),9<m&&f.classList.add("filter-value-hidden");var p=f.appendChild(document.createElement("input"));p.type="checkbox";var g="".concat(e._targetId,"-filter-value-").concat(s,"-value-").concat(m);p.id=g,p.counterpart=h,p.addEventListener("change",function(){this.counterpart.selected=this.checked,e._filterData()});var v=f.appendChild(document.createElement("label"));if(v.setAttribute("for",g),v.appendChild(document.createTextNode("".concat(h.facetValue," (").concat(h.count,")"))),m>e._configuration.maxNumOfFacets-1){var b=u.appendChild(document.createElement("span"));b.classList.add("filter-value-hidden"),b.classList.add("filter-value-overflow-message"),b.innerText="(showing the first 50 items only)",e._notifyStatus({type:"alert",message:"Too many facets, only a partial list is shown in the Filter section"});break}}if(10<e._stateManager.filterStatus[s].length){var y=u.appendChild(document.createElement("span"));y.classList.add("unfold-fold-ctrl"),y.addEventListener("click",function(e){e.target.parentNode.classList.toggle("unfold-fold-fold")})}}t.appendChild(o)}else console.error("No filters found.")}function p(){if(!this.classList.contains("selected")){this.classList.add("selected");for(var e=this.parentElement.firstElementChild;e;)e!==this&&e.classList.remove("selected"),e=e.nextElementSibling;var t=this.getData();this.parentElement.nextElementSibling.update(t)}}function g(e){for(var t=this;t.lastElementChild;)t.removeChild(t.lastElementChild);t.data=e;for(var a=0;a<e.all.length;a++){var n=e.all[a],r=t.appendChild(document.createElement("span"));r.classList.add("data-table-config-selection-unit");var o=r.appendChild(document.createElement("input"));o.setAttribute("name",e.name);var i="config-panel-label";switch(e.name){case"scheme":o.setAttribute("type","radio"),i+="scheme-item-"+a;break;case"columns":o.setAttribute("type","checkbox"),i+="column-item-"+a;break;default:console.log("what?")}o.setAttribute("value",n),o.checked=e.selected.includes(n),o.setAttribute("id",i);var l=document.createElement("label");l.setAttribute("for",i),l.appendChild(document.createTextNode(n)),r.appendChild(l)}}function v(){for(var e={name:this.data.name,selected:[]},t=this.firstChild;t;)t.firstChild.checked&&e.selected.push(t.firstChild.value),t=t.nextSibling;return e}function b(o){var e=document.createElement("table");e.id=o._targetId+"-table-section",e.classList.add("table-section"),e.appendChild(document.createElement("caption")).appendChild(document.createTextNode(o._configuration.caption));var i=e.appendChild(document.createElement("thead")).appendChild(document.createElement("tr"));switch(i.classList.add("table-header-row"),o._configuration.stickyHeader&&i.classList.add("sticky-header"),o._configuration.firstColumnType){case"number":var t=i.appendChild(document.createElement("th"));t.innerHTML="#",t.classList.add("table-row-index-column"),t.style.width=6*(o._dataManager.cache.totalCount+"").length+24+"px";break;case"checkbox":var a=i.appendChild(document.createElement("input"));a.setAttribute("type","checkbox"),a.classList.add("table-row-index-column"),a.style.width="24px"}var n=!0,r=!1,l=void 0;try{for(var c,s=o._columnSetting.shownColumns[Symbol.iterator]();!(n=(c=s.next()).done);n=!0){var d=c.value,u=i.appendChild(document.createElement("th")),m=u.appendChild(document.createElement("span"));m.classList.add("table-row-regular-column-name"),m.appendChild(document.createTextNode(o._columnSetting.colModel[d].label)),m.setAttribute("aria-label",o._columnSetting.colModel[d].label);var h=o._columnSetting.colModel[d];if(h.width&&(u.style.width=h.width),h.tips){var f=u.appendChild(document.createElement("span"));f.classList.add("tooltiptext"),f.setAttribute("aria-label",h.tips),f.appendChild(document.createElement("span")).innerHTML=h.tips}h.sortable&&function(){m.classList.add("table-row-filter-column-name");var e=u.appendChild(document.createElement("div"));e.classList.add("table-sorting-control-container"),e._colName=d;var n=e.appendChild(document.createElement("i"));n.classList.add("table-sorting-control","table-sorting-up-control"),n._colName=d,n.setAttribute("role","button"),n.setAttribute("aria-label","sort in ascending order"),n.addEventListener("click",function(){for(var e=i.getElementsByClassName("table-sorting-control"),t=0,a=e.length;t<a;t++)e[t].classList.remove("table-sorting-control-active");n.classList.add("table-sorting-control-active"),o._sortOnColumn(n._colName,1)});var r=e.appendChild(document.createElement("i"));r.classList.add("table-sorting-control","table-sorting-down-control"),r._colName=d,r.setAttribute("role","button"),r.setAttribute("aria-label","sort in descending order"),r.addEventListener("click",function(){for(var e=i.getElementsByClassName("table-sorting-control"),t=0,a=e.length;t<a;t++)e[t].classList.remove("table-sorting-control-active");r.classList.add("table-sorting-control-active"),o._sortOnColumn(r._colName,-1)})}()}}catch(e){r=!0,l=e}finally{try{n||null==s.return||s.return()}finally{if(r)throw l}}return e.appendChild(document.createElement("tbody")),e}function a(e){var t=document.getElementById(e._targetId),a=document.createElement("div");t.parentNode.insertBefore(a,t),t.parentNode.removeChild(t),a.id=e._targetId,a.classList.add(e._uid,e._configuration.scheme),a.setAttribute("role","table");var n=document.createDocumentFragment(),r=n.appendChild(document.createElement("div"));r.classList.add("search-bar-panel"),e._configuration.search&&r.appendChild(function(e){var t=document.createElement("div");t.id=e._targetId+"-search-bar",t.classList.add("search-bar-wrapper");var a=t.appendChild(document.createElement("input"));a.type="search",a.id=e._targetId+"-search-box",a.classList.add("search-box"),a.setAttribute("aria-label","search box"),a.addEventListener("focus",function(){this.parentElement.classList.remove("search-hints-active")});var n=t.appendChild(document.createElement("label"));n.htmlFor=a.id,n.classList.add("label-for-search-box"),n.setAttribute("role","button"),n.setAttribute("aria-label","search button"),n.appendChild(document.createTextNode("Search"));var r=t.appendChild(document.createElement("span"));r.classList.add("question-mark"),r.setAttribute("role","button"),r.setAttribute("aria-label","hints for search syntax"),r.addEventListener("click",function(){this.parentElement.classList.add("search-hints-active")});var o=t.appendChild(document.createElement("div"));o.classList.add("search-hints-wrapper"),o.setAttribute("role","table");var i=o.appendChild(document.createElement("p"));i.innerText='Syntax: "column name":[[operator] value] [AND | OR] ["column name"[:[operator]value]]',i.setAttribute("role","row");var l=o.appendChild(document.createElement("p"));return l.appendChild(document.createTextNode("e.g. ")),l.appendChild(document.createElement("span")).appendChild(document.createTextNode('"length": > 120')),l.appendChild(document.createElement("span")).appendChild(document.createTextNode(";")),l.appendChild(document.createElement("span")).appendChild(document.createTextNode('"height": 80 AND "width": 100')),l.setAttribute("role","row"),t}(e));var o=n.appendChild(document.createElement("div"));o.id=e._targetId+"-filter-viz-download-buttons-wrapper",o.classList.add("filter-viz-download-buttons-wrapper"),o.appendChild(function(n){var e=document.createDocumentFragment(),t=e.appendChild(document.createElement("div"));t.classList.add("data-table-config-icon"),t.setAttribute("role","button"),t.setAttribute("aria-label","configuration button");for(var a=0;a<4;a++){t.appendChild(document.createElement("div")).classList.add("config-icon-child")}t.appendChild(document.createElement("div")).classList.add("data-table-config-icon-outer-circle"),t.appendChild(document.createElement("div")).classList.add("data-table-config-icon-inner-circle"),t.addEventListener("click",function(){document.getElementById(n._targetId).getElementsByClassName("data-table-config-panel")[0].classList.add("active")});var r=e.appendChild(document.createElement("div"));r.classList.add("data-table-config-panel");var o=r.appendChild(document.createElement("div"));o.classList.add("data-table-config-panel-content");var i=o.appendChild(document.createElement("div"));i.classList.add("data-table-config-panel-header");var l=i.appendChild(document.createElement("span"));l.setAttribute("role","button"),l.setAttribute("aria-label","select columns to show"),l.appendChild(document.createTextNode("Columns")),l.classList.add("selected"),l.getData=function(){return{name:"columns",all:n._columnSetting.allColumns,selected:n._columnSetting.shownColumns}},l.addEventListener("click",p),setTimeout(function(){i.nextElementSibling.update(l.getData())},1e3);var c=i.appendChild(document.createElement("span"));c.setAttribute("role","button"),c.setAttribute("aria-label","select color scheme"),c.appendChild(document.createTextNode("Style")),c.getData=function(){return{name:"scheme",all:n._configuration.schemes,selected:[n._configuration.scheme]}},c.addEventListener("click",p);var s=o.appendChild(document.createElement("div"));s.classList.add("data-table-config-panel-body"),s.update=g,s.pullData=v;var d=o.appendChild(document.createElement("div"));d.classList.add("data-table-config-panel-confirm-button-wrapper");var u=d.appendChild(document.createElement("span"));u.setAttribute("role","button"),u.setAttribute("arial-label","cancel"),u.classList.add("data-table-config-panel-confirm-button"),u.appendChild(document.createTextNode("Cancel")),u.addEventListener("click",function(){document.getElementById(n._targetId).getElementsByClassName("data-table-config-panel")[0].classList.remove("active")});var m=d.appendChild(document.createElement("span"));return m.setAttribute("role","button"),m.setAttribute("arial-label","save"),m.classList.add("data-table-config-panel-confirm-button"),m.appendChild(document.createTextNode("Save")),m.addEventListener("click",function(){document.getElementById(n._targetId).getElementsByClassName("data-table-config-panel")[0].classList.remove("active");var e=s.pullData();switch(e.name){case"columns":n._columnSetting.shownColumns=s.pullData().selected,n._updateWholeTableView();break;case"scheme":var t=n._configuration.scheme;n._configuration.scheme=e.selected[0];var a=document.getElementById(n._targetId);a.classList.remove(t),a.classList.add(n._configuration.scheme);break;default:console.log("What?")}}),e}(e)),e._configuration.layout.download&&o.appendChild(function(x){var e=document.createElement("div");e.classList.add("table-top-button","download-control-button");var t=document.createElement("span");t.appendChild(document.createTextNode("Download")),e.appendChild(t),e.setAttribute("role","button"),e.setAttribute("aria-label","download button");var n=document.createElement("form");n.classList.add("data-table-download-type-options");for(var a=function(){var S=o[r],e=document.createElement("span"),t=e.appendChild(document.createElement("input"));t.type="radio",t.value=S,t.id=x._targetId+"-data-table-download-type-option-"+S,t.classList.add("data-table-download-type-option"),t.name="data-table-download-type",e.appendChild(t);var a=document.createElement("label");a.classList.add("data-table-download-type-option-label"),a.appendChild(document.createTextNode(S)),a.htmlFor="data-table-download-type-option "+S,a.addEventListener("click",function(){var e=document.createElement("a");if(e.setAttribute("download",x._configuration.fileName+"."+S.toLowerCase()),x._configuration.urlForDownloading){var t="".concat(x._configuration.urlForDownloading,"&type=").concat(S.toLowerCase()),a=x._configuration.columnsToDownload?x._configuration.columnsToDownload:x._columnSetting.shownColumns,n=!0,r=!1,o=void 0;try{for(var i,l=a[Symbol.iterator]();!(n=(i=l.next()).done);n=!0){var c=i.value;t+="&field=".concat(c)}}catch(e){r=!0,o=e}finally{try{n||null==l.return||l.return()}finally{if(r)throw o}}var s=x._stateManager.queryObject();if(s.filter){var d=Object.keys(s.filter);if(0<d.length){var u=!0,m=!1,h=void 0;try{for(var f,p=d[Symbol.iterator]();!(u=(f=p.next()).done);u=!0){var g=f.value,v=s.filter[g],b=!0,y=!1,C=void 0;try{for(var _,w=v[Symbol.iterator]();!(b=(_=w.next()).done);b=!0){var E=_.value;t+="&filter=".concat(g,"_._").concat(E)}}catch(e){y=!0,C=e}finally{try{b||null==w.return||w.return()}finally{if(y)throw C}}}}catch(e){m=!0,h=e}finally{try{u||null==p.return||p.return()}finally{if(m)throw h}}}}var L=Object.keys(s.sort);L.length&&(t+="&sort=".concat(L[0],"_._").concat(s.sort[L[0]])),e.setAttribute("href",t)}else if(x._dataManager.dataIsComplete&&x._configuration.dataToDownload){var k;switch(S){case"CSV":k=T(x._configuration.dataToDownload,",");break;case"TSV":k=T(x._configuration.dataToDownload,"\t");break;case"JSON":k=JSON.stringify(x._configuration.dataToDownload)}e.setAttribute("href","data:text/".concat(S.toLowerCase(),";charset=utf-8,").concat(encodeURIComponent(k)))}else e.addEventListener("click",function(){alert("Sorry, the data is not ready for downloading.")});e.style.display="none",document.body.appendChild(e),e.click(),document.body.removeChild(e)}),e.appendChild(a),n.appendChild(e)},r=0,o=["CSV","TSV","JSON"];r<o.length;r++)a();return e.appendChild(n),e}(e));var i=n.appendChild(document.createElement("div"));i.id=e._targetId+"-filter-section",i.classList.add("filter-section");var l=n.appendChild(document.createElement("div"));l.id=e._targetId+"-visualization-section",l.classList.add("visualization-section"),n.appendChild(function(e){var t=document.createElement("div");t.id=e._targetId+"-notification-section",t.classList.add("notification-section");var a=t.appendChild(document.createElement("div"));a.classList.add("progress-bar");var n=a.appendChild(document.createElement("div"));n.classList.add("progress-dot-wrapper");for(var r=0;r<3;r++){var o=n.appendChild(document.createElement("span"));o.classList.add("progress-dot"),o.classList.add("dot-num-".concat(r+1))}var i=t.appendChild(document.createElement("div"));i.classList.add("error-message"),i.classList.add("message-bar");var l=t.appendChild(document.createElement("div"));return l.classList.add("alert-message"),l.classList.add("message-bar"),t}(e));var c=document.createElement("div");c.classList.add("table-frame"),c.appendChild(b(e)),n.appendChild(c),e._configuration.pagination?n.appendChild(function(t){var e=document.createElement("div");e.id=t._targetId+"-pager-section",e.classList.add("table-page-control-container");var a=e.appendChild(document.createElement("div"));a.classList.add("table-rows-per-page-control-container");var n=a.appendChild(document.createElement("label"));n.appendChild(document.createTextNode("Rows per page:"));var r=a.appendChild(document.createElement("select"));r.id=t._targetId+"-table-row-number-selector",n.setAttribute("for",r.id),r.classList.add("table-row-number-selector"),r.setAttribute("aria-label","showing ".concat(t._stateManager.rowsPerPage," rows per page"));for(var o=[5,10,20,50,100,200],i=0,l=o;i<l.length;i++){var c=l[i];r.appendChild(document.createElement("option")).appendChild(document.createTextNode(c+""))}r.selectedIndex=o.indexOf(t._stateManager.rowsPerPage),r.addEventListener("change",function(){this.setAttribute("aria-label","showing ".concat(this.value," rows per page")),t._updateRowsPerPage(+this.value)});var s=e.appendChild(document.createElement("div"));s.classList.add("table-page-number-control-container");var d=s.appendChild(document.createElement("div"));d.classList.add("table-page-number-control-block","table-page-number-minus-one"),d.setAttribute("role","button"),d.setAttribute("aria-label","last page"),d.addEventListener("click",function(){t._setPageNumber(t._stateManager.currentPageNumber-1)});var u=s.appendChild(document.createElement("div"));u.classList.add("table-page-number-current-container");var m=u.appendChild(document.createElement("label"));m.appendChild(document.createTextNode("Page"));var h=u.appendChild(document.createElement("input"));h.type="text",h.id=t._targetId+"-table-page-number-current",m.setAttribute("for",h.id),h.setAttribute("aria-label","current page is 1"),h.addEventListener("change",function(){var e=+this.value;isNaN(e)?alert("Invalid page number!"):t._setPageNumber(e)});var f=u.appendChild(document.createElement("label"));f.appendChild(document.createTextNode("of"));var p=u.appendChild(document.createElement("input"));p.type="text",p.id=t._targetId+"-table-page-number-total",f.setAttribute("for",p.id),p.classList.add("table-page-number-total"),p.readonly=!0;var g=t._totalPages();p.value=g,p.setAttribute("aria-label","all ".concat(g," pages"));var v=s.appendChild(document.createElement("div"));return v.classList.add("table-page-number-control-block"),v.classList.add("table-page-number-plus-one"),v.setAttribute("role","button"),v.setAttribute("aria-label","next page"),v.addEventListener("click",function(){t._setPageNumber(t._stateManager.currentPageNumber+1)}),e}(e)):e._stateManager.rowsPerPage=e._dataManager.cache.totalCount,a.appendChild(n),e._updateTableBodyView().catch(function(e){console.error(e)}),e._configuration.layout.filter&&e._createFilterSection().catch(function(e){console.error(e)})}return function(){function n(e,t){var a=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{dataIsComplete:!0};if(_classCallCheck(this,n),"string"!=typeof t||!t)throw new TypeError("target id should be a non-empty string");this._targetId=t,this._dataManager=new o(e,a),this._stateManager=new i,this._columnSetting=new r(this._dataManager.data),this._configuration={caption:"",maxNumOfFacets:50,layout:{download:!1,filter:!1,chart:!1,search:!1,column_selector:!1},firstColumnType:void 0,scheme:"default",schemes:["default","light","dark"],fileName:a.fileName?a.fileName:"data",urlForDownloading:a.urlForDownloading,columnsToDownload:a.columnsToDownload,dataToDownload:a.dataToDownload,stickyHeader:a.stickyHeader,pagination:void 0===a.pagination||a.pagination},this._uid="my-1535567872393-product"}var e,t;return _createClass(n,[{key:"setRowsPerPage",value:function(e){if("number"!=typeof e||e<0)throw new Error("a natural number expected");if(![5,10,20,50,100,200].includes(e))throw"".concat(e," is invalid");this._stateManager.rowsPerPage=e}},{key:"setFormatter",value:function(e,t){if("string"!=typeof e||!this._columnSetting.colModel[e])throw new Error("Column name ".concat(e," not recognized."));if("string"!=typeof t){if("function"!=typeof t)throw new Error("A predefined formatter name or custom function expected.");this._columnSetting.colModel[e].formatter=t}else{var a=x[t];if(!a)throw new Error("The formatter name ".concat(t," not recognized."));this._columnSetting.colModel[e].formatter=a}}},{key:"configureColumn",value:function(e,t){this._columnSetting.configureColumn(e,t)}},{key:"configureLayout",value:function(e,t){if("string"!=typeof e)throw"Invalid property: "+e;switch(e.toUpperCase()){case"DOWNLOAD":this._configuration.layout.download=t;break;case"FILTER":this._configuration.layout.filter=t;break;case"CHART":this._configuration.layout.chart=t;break;case"SEARCH":this._configuration.layout.search=t;break;case"COLUMN_SELECTOR":this._configuration.layout.selectColumns=t;break;default:return console.error("Property not recognized!"),void console.error("Expect: download | search | filter | chart | column_selector")}console.log("Configuration updated.")}},{key:"setShownColumns",value:function(e){this._columnSetting.setShownColumns(e)}},{key:"addFilter",value:function(e,t){if(!this._columnSetting.shownColumns.includes(e))throw"the column name ".concat(e," is invalid");this._stateManager.filterStatus[e]=[],this._configuration.layout.filter=!0}},{key:"setCaption",value:function(e){"string"==typeof e&&0<e.length&&(this._configuration.caption=e)}},{key:"setScheme",value:function(e){this._configuration.scheme=e}},{key:"setFirstColumnType",value:function(e,t){if("string"!=typeof e)throw new TypeError("a string expected to set the type of the first column");switch(e.toLowerCase()){case"number":this._configuration.firstColumnType="number";break;case"checkbox":this._configuration.firstColumnType="checkbox";break;case"image":if(this._configuration.firstColumnType="image","img"!==t.tagName)throw new TypeError("an img element descriptor expected");this._configuration.firstColumnFormatter=t.formatter;break;case"custom":this._configuration.firstColumnType="custom";var a=document.createElement(t.tagName);if("[object HTMLUnknownElement]"===Object.prototype.toString.call(a))throw"invalid tag name to create custom element";this._configuration.firstColumnFormatter=t.formatter;break;default:throw new TypeError("valid types: number, checkbox, image, custom")}}},{key:"generate",value:function(){a(this)}},{key:"_totalPages",value:function(){var e=Math.floor(this._dataManager.cache.totalCount/this._stateManager.rowsPerPage)+1;if(isNaN(e))throw"invalid total page number";return e}},{key:"_setPageNumber",value:function(e){e<1||e>this._totalPages()?alert("Page number out of range!"):(this._stateManager.currentPageNumber=e,this._updateTableBodyView().catch(function(e){console.error(e.message)}))}},{key:"_updateRowsPerPage",value:function(e){this._stateManager.rowsPerPage=e,this._stateManager.currentPageNumber=1,this._updateTableBodyView().catch(function(e){console.error(e.message)})}},{key:"_sortOnColumn",value:function(e,t){this._stateManager.sort={},this._stateManager.sort[e]=t,this._stateManager.currentPageNumber=1,this._updateTableBodyView().catch(function(e){console.error(e.message)})}},{key:"_filterData",value:function(){var t=this;this._stateManager.currentPageNumber=1,this._updateTableBodyView().then(function(){var e=document.getElementById(t._targetId+"-filter-viz-download-buttons-wrapper");Object.keys(t._stateManager.filter).length?e.classList.add("filter-active"):e.classList.remove("filter-active")}).catch(function(e){console.error(e.message)})}},{key:"_notifyStatus",value:function(e){!function(e,t){var a=document.getElementById(e+"-notification-section"),n=a.getElementsByClassName("message-bar");switch(t.type){case"progress":a.classList.add("progress-active"),a.classList.remove("error-active","alert-active");break;case"error":a.classList.add("error-active"),a.classList.remove("alert-active","progress-active"),n[0].innerText=t.message;break;case"alert":a.classList.add("alert-active"),a.classList.remove("error-active","progress-active"),n[1].innerText=t.message;break;case"success":a.classList.remove("progress-active"),a.classList.remove("error-active","alert-active");break;default:a.classList.remove("progress-active"),a.classList.remove("error-active","alert-active")}}(this._targetId,e)}},{key:"_updateTableBodyView",value:(t=_asyncToGenerator(regeneratorRuntime.mark(function e(){var t,a,n;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t=null,e.prev=1,this._notifyStatus({type:"progress",message:""}),e.next=5,this._dataManager.serve(this._stateManager.queryObject());case 5:a=e.sent,t=a.data,e.next=13;break;case 9:throw e.prev=9,e.t0=e.catch(1),this._notifyStatus({type:"error",message:"failed to load data"}),e.t0;case 13:e.prev=13,n=this._totalPages(),l(this,t,n),this._notifyStatus({type:"success",message:""}),e.next=23;break;case 19:throw e.prev=19,e.t1=e.catch(13),this._notifyStatus({type:"error",message:"failed to update the view"}),e.t1;case 23:case"end":return e.stop()}},e,this,[[1,9],[13,19]])})),function(){return t.apply(this,arguments)})},{key:"_updateWholeTableView",value:function(){var e=this._targetId+"-table-section",t=document.getElementById(e);t.id=e+"-to-be-removed";var a=b(this);t.parentNode.insertBefore(a,t),t.parentNode.removeChild(t),this._updateTableBodyView().catch(function(e){console.error(e)})}},{key:"_createFilterSection",value:(e=_asyncToGenerator(regeneratorRuntime.mark(function e(){var t,a,n,r,o,i,l,c;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t=null,e.prev=1,e.next=4,this._dataManager.serve({facets:Object.keys(this._stateManager.filterStatus)});case 4:t=e.sent,e.next=11;break;case 7:throw e.prev=7,e.t0=e.catch(1),this._notifyStatus({type:"error",message:"failed to create the filter section"}),e.t0;case 11:for(a={},r=!(n=!0),o=void 0,e.prev=15,i=t[Symbol.iterator]();!(n=(l=i.next()).done);n=!0)c=l.value,a[c.name]=c.facets;e.next=23;break;case 19:e.prev=19,e.t1=e.catch(15),r=!0,o=e.t1;case 23:e.prev=23,e.prev=24,n||null==i.return||i.return();case 26:if(e.prev=26,r)throw o;e.next=29;break;case 29:return e.finish(26);case 30:return e.finish(23);case 31:this._stateManager.filterStatus=a,e.prev=32,m(this),e.next=39;break;case 36:throw e.prev=36,e.t2=e.catch(32),e.t2;case 39:case"end":return e.stop()}},e,this,[[1,7],[15,19,23,31],[24,,26,30],[32,36]])})),function(){return e.apply(this,arguments)})}]),n}()}();