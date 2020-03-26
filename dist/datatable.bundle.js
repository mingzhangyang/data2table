var DataTable=function(){"use strict";class e{constructor(e){this.colModel={},this.allColumns=[];let t=new Set;for(let a of e){let e=Object.keys(a);for(let a of e)t.add(a)}for(let e of t)this.colModel[e]={name:e,label:e,tips:"",sortable:!1,hidden:!1,width:"",align:"",formatter:void 0},this.allColumns.push(e);this.shownColumns=this.allColumns.slice(),this.hiddenColumns=[]}configureColumn(e,t){if(!this.colModel[e])throw new Error("Column name not recognized.");if("object"!=typeof t)throw new Error("An object describing the column expected.");if(Object.assign(this.colModel[e],t),this.colModel[e].hidden||!1===this.colModel[e].shown){let t=this.shownColumns.indexOf(e);-1!==t&&this.hiddenColumns.push(this.shownColumns.splice(t,1)[0])}}setShownColumns(e){let t=[];for(let a of e){if(!this.allColumns.includes(a))throw"invalid column name found when set shown columns";t.push(a)}this.shownColumns=t,this.hiddenColumns=this.allColumns.filter(e=>!t.includes(e))}setOrderedAllColumns(e){for(let t of e)if(!this.allColumns.includes(t))throw"invalid column name found when set shown columns";this.allColumns=e}}function t(e,t){let a=new Map;for(let n of e){let e=n[t];"object"==typeof e&&(e=e.valueForFaceting);let l=a.get(e);void 0===l?a.set(e,1):a.set(e,l+1)}let n=[];for(let[e,t]of a)n.push({facetType:"value",facetValue:e,count:t});return n.sort((e,t)=>e.count>t.count?-1:e.count<t.count?1:e.facetValue>t.facetValue?-1:1),n}const a=function(e,a){let n=[];for(let l of a){let a={name:l};a.facets=t(e,l),n.push(a)}return n};function n(e,t){if(e===t)return!0;if(Object.prototype.toString.call(e)!==Object.prototype.toString.call(t))return!1;let a=Object.keys(e),l=Object.keys(t);if(a.length!==l.length)return!1;for(let l of a){let a=e[l],o=t[l];if(Object.prototype.toString.call(a)!==Object.prototype.toString.call(o))return!1;if("object"==typeof a){if(!n(a,o))return!1}else if(a!==o)return!1}return!0}const l=200,o=[5*l,4*l,3*l,2*l,l];class r{constructor(e,t){if(!Array.isArray(e))throw new TypeError("an array of objects expected");if("[object Object]"!==Object.prototype.toString.call(e[0]))throw new TypeError("an array of objects expected");if(this.dataIsComplete=t.dataIsComplete,this.dataIsComplete)this.data=e,this.batchSize=e.length,this.cache={data:this.data.slice(),queryObject:{filter:{},sort:{}},range:[0,this.batchSize],totalCount:e.length},this.fetchData=function(e){let t=e.start,a=e.limit,n=e.filter,l=e.sort,o=this.data.slice();if(n){let e=Object.keys(n);for(let t of e)o=Array.isArray(n[t])?o.filter(e=>"object"==typeof e[t]?n[t].includes(e[t].valueForFiltering):n[t].includes(e[t])):o.filter(e=>"object"==typeof e[t]?n[t]===e[t].valueForFiltering:n[t]===e[t])}if(l){let e=Object.keys(l)[0],t=l[e];1===t?o.sort((t,a)=>"object"==typeof t[e]&&"object"==typeof a[e]?t[e].valueForSorting<a[e].valueForSorting?-1:1:t[e]<a[e]?-1:1):-1===t&&o.sort((t,a)=>"object"==typeof t[e]&&"object"==typeof a[e]?t[e].valueForSorting<a[e].valueForSorting?1:-1:t[e]<a[e]?1:-1)}return{data:o.slice(t,t+a),totalCount:o.length}}.bind(this);else{if(e.length<l)throw`dataIsComplete is set false, but the provided dataset contains less than ${l} rows`;for(let t of o)if(e.length>=t){this.data=e.slice(0,t),this.batchSize=t,this.cache={data:this.data.slice(),queryObject:{filter:{},sort:{}},range:[0,this.batchSize]};break}if(!t.fetchData)throw"data is not complete, a fetchData function is required";if("function"!=typeof t.fetchData)throw new TypeError("fetchData should be a function");if(!t.totalCount)throw"data is not complete, a totalCount property indicating total rows is missing";this.fetchData=t.fetchData,this.cache.totalCount=t.totalCount}}async serve(e){if(Array.isArray(e.facets))return a(this.data,e.facets);let t=e.start?e.start:0,l=e.limit?e.limit:10,o=e.filter?e.filter:{},r=e.sort?e.sort:{};if(i=e,s=this.cache.queryObject,n(i.sort,s.sort)&&n(i.filter,s.filter)&&t>=this.cache.range[0]&&t<this.cache.range[1]){let e=t-this.cache.range[0];return{data:this.cache.data.slice(e,e+l),totalCount:this.cache.totalCount}}var i,s;let c=t-t%this.batchSize,d={start:c,limit:this.batchSize,filter:o,sort:r},u=null;try{u=await this.fetchData(d)}catch(e){throw e}this.cache.data=u.data,this.cache.queryObject=d,this.cache.range=[c,c+this.batchSize],this.cache.totalCount=u.totalCount;let m=t-c;return{data:this.cache.data.slice(m,m+l),totalCount:u.totalCount}}}class i{constructor(){this.rowsPerPage=10,this.currentPageNumber=1,this.sort={},this.filter={},this.filterStatus={}}extractFilter(){let e={},t=Object.keys(this.filterStatus);for(let a of t){let t=this.filterStatus[a].filter(e=>e.selected);t.length>0&&(e[a]=t.map(e=>e.facetValue))}return this.filter=e,e}getStart(){return(this.currentPageNumber-1)*this.rowsPerPage}queryObject(){return{start:(this.currentPageNumber-1)*this.rowsPerPage,limit:this.rowsPerPage,filter:this.extractFilter(),sort:this.sort}}}const s={highlight:function(e){return`<mark>${e}</mark>`},addLink:function(e){return`<a href="${e.link}">${e.text}</a>`},bold:function(e){return`<strong>${e}</strong>`},colorText:function(e){return`<span style="color: ${e.color}">${e.text}</span>`}};function c(e){return s[e]}function d(e,t=","){if(!Array.isArray(e))throw new TypeError("an array of objects expected");if(0===e.length)return"";let a=Object.keys(e[0]),n=a.map(e=>e.includes(t)?`"${e}"`:e).join(t)+"\n";for(let l of e){let e=a.map(e=>l[e]);n+=(e=e.map(e=>e.includes(t)?`"${e}"`:e)).join(t)+"\n"}return n}function u(e){switch(typeof e){case"number":return e+"";case"string":return e;case"boolean":return e+"";case"object":return Array.isArray(e)?e.join(", "):null===e?"N/A":JSON.stringify(e);default:return"N/A"}}function m(){if(this.classList.contains("selected"))return;this.classList.add("selected");let e=this.parentElement.firstElementChild;for(;e;)e!==this&&e.classList.remove("selected"),e=e.nextElementSibling;let t=this.getData();this.parentElement.nextElementSibling.update(t)}function h(e){let t=this;for(;t.lastElementChild;)t.removeChild(t.lastElementChild);t.data=e;for(let a=0;a<e.all.length;a++){let n=e.all[a],l=t.appendChild(document.createElement("span"));l.classList.add("data-table-config-selection-unit");let o=l.appendChild(document.createElement("input"));o.setAttribute("name",e.name);let r="config-panel-label";switch(e.name){case"scheme":o.setAttribute("type","radio"),r+="scheme-item-"+a;break;case"columns":o.setAttribute("type","checkbox"),r+="column-item-"+a;break;default:console.log("what?")}o.setAttribute("value",n),o.checked=e.selected.includes(n),o.setAttribute("id",r);let i=document.createElement("label");i.setAttribute("for",r),i.appendChild(document.createTextNode(n)),l.appendChild(i)}}function p(){let e={name:this.data.name,selected:[]},t=this.firstChild;for(;t;)t.firstChild.checked&&e.selected.push(t.firstChild.value),t=t.nextSibling;return e}function f(e){let t=document.createElement("table");t.id=e._targetId+"-table-section",t.classList.add("table-section"),t.appendChild(document.createElement("caption")).appendChild(document.createTextNode(e._configuration.caption));let a=t.appendChild(document.createElement("thead")).appendChild(document.createElement("tr"));switch(a.classList.add("table-header-row"),e._configuration.stickyHeader&&a.classList.add("sticky-header"),e._configuration.firstColumnType){case"number":let n=a.appendChild(document.createElement("th"));n.innerHTML="#",n.classList.add("table-row-index-column"),n.style.width=6*(e._dataManager.cache.totalCount+"").length+24+"px";break;case"checkbox":let l=a.appendChild(document.createElement("th"));l.classList.add("table-row-index-column","table-row-checkbox-column"),l.style.width="30px";let o=l.appendChild(document.createElement("input"));o.type="checkbox",o.id=`${e._targetId}-table-header-checkbox`,o.addEventListener("change",function(a){let n=t.querySelectorAll("td input.table-row-checkbox");if(o.classList.contains("partial")){o.checked=!1;for(let t of n)if(t.checked){t.checked=!1;let a=t.parentElement.parentElement;a.classList.remove("table-row-selected"),e._selectedRows.delete(a._attachedData)}o.classList.remove("partial")}else if(o.checked)for(let t of n){t.checked=!0;let a=t.parentElement.parentElement;a.classList.add("table-row-selected"),e._selectedRows.add(a._attachedData)}else for(let t of n){t.checked=!1;let a=t.parentElement.parentElement;a.classList.remove("table-row-selected"),e._selectedRows.delete(a._attachedData)}}),l.appendChild(document.createElement("label")).setAttribute("for",o.id)}for(let t of e._columnSetting.shownColumns){let n=a.appendChild(document.createElement("th")),l=n.appendChild(document.createElement("span"));l.classList.add("table-row-regular-column-name"),l.appendChild(document.createTextNode(e._columnSetting.colModel[t].label)),l.setAttribute("aria-label",e._columnSetting.colModel[t].label);let o=e._columnSetting.colModel[t];if(o.width&&(n.style.width=o.width),o.tips){let e=n.appendChild(document.createElement("span"));e.classList.add("tooltiptext"),e.setAttribute("aria-label",o.tips),e.appendChild(document.createElement("span")).innerHTML=o.tips}if(o.sortable){l.classList.add("table-row-filter-column-name");let o=n.appendChild(document.createElement("div"));o.classList.add("table-sorting-control-container"),o._colName=t;let r=o.appendChild(document.createElement("i"));r.classList.add("table-sorting-control","table-sorting-up-control"),r._colName=t,r.setAttribute("role","button"),r.setAttribute("aria-label","sort in ascending order"),r.addEventListener("click",function(){let t=a.getElementsByClassName("table-sorting-control");for(let e=0,a=t.length;e<a;e++)t[e].classList.remove("table-sorting-control-active");r.classList.add("table-sorting-control-active"),e._sortOnColumn(r._colName,1)});let i=o.appendChild(document.createElement("i"));i.classList.add("table-sorting-control","table-sorting-down-control"),i._colName=t,i.setAttribute("role","button"),i.setAttribute("aria-label","sort in descending order"),i.addEventListener("click",function(){let t=a.getElementsByClassName("table-sorting-control");for(let e=0,a=t.length;e<a;e++)t[e].classList.remove("table-sorting-control-active");i.classList.add("table-sorting-control-active"),e._sortOnColumn(i._colName,-1)})}}return t.appendChild(document.createElement("tbody")),t}function g(e){let t=document.getElementById(e._targetId),a=document.createElement("div");t.parentNode.insertBefore(a,t),t.parentNode.removeChild(t),a.id=e._targetId,a.classList.add(e._uid,e._configuration.scheme),a.setAttribute("role","table");let n=document.createDocumentFragment(),l=n.appendChild(document.createElement("div"));l.classList.add("search-bar-panel"),e._configuration.search&&l.appendChild(function(e){let t=document.createElement("div");t.id=e._targetId+"-search-bar",t.classList.add("search-bar-wrapper");let a=t.appendChild(document.createElement("input"));a.type="search",a.id=e._targetId+"-search-box",a.classList.add("search-box"),a.setAttribute("aria-label","search box"),a.addEventListener("focus",function(){this.parentElement.classList.remove("search-hints-active")});let n=t.appendChild(document.createElement("label"));n.htmlFor=a.id,n.classList.add("label-for-search-box"),n.setAttribute("role","button"),n.setAttribute("aria-label","search button"),n.appendChild(document.createTextNode("Search"));let l=t.appendChild(document.createElement("span"));l.classList.add("question-mark"),l.setAttribute("role","button"),l.setAttribute("aria-label","hints for search syntax"),l.addEventListener("click",function(){this.parentElement.classList.add("search-hints-active")});let o=t.appendChild(document.createElement("div"));o.classList.add("search-hints-wrapper"),o.setAttribute("role","table");let r=o.appendChild(document.createElement("p"));r.innerText='Syntax: "column name":[[operator] value] [AND | OR] ["column name"[:[operator]value]]',r.setAttribute("role","row");let i=o.appendChild(document.createElement("p"));return i.appendChild(document.createTextNode("e.g. ")),i.appendChild(document.createElement("span")).appendChild(document.createTextNode('"length": > 120')),i.appendChild(document.createElement("span")).appendChild(document.createTextNode(";")),i.appendChild(document.createElement("span")).appendChild(document.createTextNode('"height": 80 AND "width": 100')),i.setAttribute("role","row"),t}(e));let o=n.appendChild(document.createElement("div"));o.id=e._targetId+"-filter-viz-download-buttons-wrapper",o.classList.add("filter-viz-download-buttons-wrapper"),o.appendChild(function(e){let t=document.createDocumentFragment(),a=t.appendChild(document.createElement("div"));a.classList.add("data-table-config-icon"),a.setAttribute("role","button"),a.setAttribute("aria-label","configuration button");for(let e=0;e<4;e++)a.appendChild(document.createElement("div")).classList.add("config-icon-child");a.appendChild(document.createElement("div")).classList.add("data-table-config-icon-outer-circle"),a.appendChild(document.createElement("div")).classList.add("data-table-config-icon-inner-circle"),a.addEventListener("click",()=>{document.getElementById(e._targetId).getElementsByClassName("data-table-config-panel")[0].classList.add("active")});let n=t.appendChild(document.createElement("div"));n.classList.add("data-table-config-panel");let l=n.appendChild(document.createElement("div"));l.classList.add("data-table-config-panel-content");let o=l.appendChild(document.createElement("div"));o.classList.add("data-table-config-panel-header");let r=o.appendChild(document.createElement("span"));r.setAttribute("role","button"),r.setAttribute("aria-label","select columns to show"),r.appendChild(document.createTextNode("Columns")),r.classList.add("selected"),r.getData=(()=>({name:"columns",all:e._columnSetting.allColumns,selected:e._columnSetting.shownColumns})),r.addEventListener("click",m),setTimeout(()=>{o.nextElementSibling.update(r.getData())},1e3);let i=o.appendChild(document.createElement("span"));i.setAttribute("role","button"),i.setAttribute("aria-label","select color scheme"),i.appendChild(document.createTextNode("Style")),i.getData=(()=>({name:"scheme",all:e._configuration.schemes,selected:[e._configuration.scheme]})),i.addEventListener("click",m);let s=l.appendChild(document.createElement("div"));s.classList.add("data-table-config-panel-body"),s.update=h,s.pullData=p;let c=l.appendChild(document.createElement("div"));c.classList.add("data-table-config-panel-confirm-button-wrapper");let d=c.appendChild(document.createElement("span"));d.setAttribute("role","button"),d.setAttribute("arial-label","cancel"),d.classList.add("data-table-config-panel-confirm-button"),d.appendChild(document.createTextNode("Cancel")),d.addEventListener("click",()=>{document.getElementById(e._targetId).getElementsByClassName("data-table-config-panel")[0].classList.remove("active")});let u=c.appendChild(document.createElement("span"));return u.setAttribute("role","button"),u.setAttribute("arial-label","save"),u.classList.add("data-table-config-panel-confirm-button"),u.appendChild(document.createTextNode("Save")),u.addEventListener("click",()=>{document.getElementById(e._targetId).getElementsByClassName("data-table-config-panel")[0].classList.remove("active");let t=s.pullData();switch(t.name){case"columns":e._columnSetting.setShownColumns(t.selected),e._updateWholeTableView();break;case"scheme":let a=e._configuration.scheme;e._configuration.scheme=t.selected[0];let n=document.getElementById(e._targetId);n.classList.remove(a),n.classList.add(e._configuration.scheme);break;default:console.log("What?")}}),t}(e)),e._configuration.layout.download&&o.appendChild(function(e){let t=document.createElement("div");t.classList.add("table-top-button","download-control-button");let a=document.createElement("span");a.appendChild(document.createTextNode("Download")),t.appendChild(a),t.setAttribute("role","button"),t.setAttribute("aria-label","download button");let n=document.createElement("form");n.classList.add("data-table-download-type-options");for(let t of["CSV","TSV","JSON"]){let a=document.createElement("span"),l=a.appendChild(document.createElement("input"));l.type="radio",l.value=t,l.id=e._targetId+"-data-table-download-type-option-"+t,l.classList.add("data-table-download-type-option"),l.name="data-table-download-type",a.appendChild(l);let o=document.createElement("label");o.classList.add("data-table-download-type-option-label"),o.appendChild(document.createTextNode(t)),o.htmlFor="data-table-download-type-option "+t,o.addEventListener("click",()=>{let a=document.createElement("a");if(a.setAttribute("download",e._configuration.fileName+"."+t.toLowerCase()),e._configuration.urlForDownloading){let n=`${e._configuration.urlForDownloading}&type=${t.toLowerCase()}`,l=e._configuration.columnsToDownload?e._configuration.columnsToDownload:e._columnSetting.shownColumns;for(let e of l)n+=`&field=${e}`;let o=e._stateManager.queryObject();if(o.filter){let e=Object.keys(o.filter);if(e.length>0)for(let t of e){let e=o.filter[t];for(let a of e)n+=`&filter=${t}_._${a}`}}let r=Object.keys(o.sort);r.length&&(n+=`&sort=${r[0]}_._${o.sort[r[0]]}`),a.setAttribute("href",n)}else if(e._dataManager.dataIsComplete&&e._configuration.dataToDownload){let n;switch(t){case"CSV":n=d(e._configuration.dataToDownload,",");break;case"TSV":n=d(e._configuration.dataToDownload,"\t");break;case"JSON":n=JSON.stringify(e._configuration.dataToDownload)}a.setAttribute("href",`data:text/${t.toLowerCase()};charset=utf-8,${encodeURIComponent(n)}`)}else a.addEventListener("click",()=>{alert("Sorry, the data is not ready for downloading.")});a.style.display="none",document.body.appendChild(a),a.click(),document.body.removeChild(a)}),a.appendChild(o),n.appendChild(a)}return t.appendChild(n),t}(e));let r=n.appendChild(document.createElement("div"));r.id=e._targetId+"-filter-section",r.classList.add("filter-section");let i=n.appendChild(document.createElement("div"));i.id=e._targetId+"-visualization-section",i.classList.add("visualization-section"),n.appendChild(function(e){let t=document.createElement("div");t.id=e._targetId+"-notification-section",t.classList.add("notification-section");let a=t.appendChild(document.createElement("div"));a.classList.add("progress-bar");let n=a.appendChild(document.createElement("div"));n.classList.add("progress-dot-wrapper");for(let e=0;e<3;e++){let t=n.appendChild(document.createElement("span"));t.classList.add("progress-dot"),t.classList.add(`dot-num-${e+1}`)}let l=t.appendChild(document.createElement("div"));l.classList.add("error-message"),l.classList.add("message-bar");let o=t.appendChild(document.createElement("div"));return o.classList.add("alert-message"),o.classList.add("message-bar"),t}(e));let s=document.createElement("div");s.classList.add("table-frame"),s.appendChild(f(e)),n.appendChild(s),e._configuration.pagination?n.appendChild(function(e){let t=document.createElement("div");t.id=e._targetId+"-pager-section",t.classList.add("table-page-control-container");let a=t.appendChild(document.createElement("div"));a.classList.add("table-rows-per-page-control-container");let n=a.appendChild(document.createElement("label"));n.appendChild(document.createTextNode("Rows per page:"));let l=a.appendChild(document.createElement("select"));l.id=e._targetId+"-table-row-number-selector",n.setAttribute("for",l.id),l.classList.add("table-row-number-selector"),l.setAttribute("aria-label",`showing ${e._stateManager.rowsPerPage} rows per page`);let o=[5,10,20,50,100,200];for(let e of o)l.appendChild(document.createElement("option")).appendChild(document.createTextNode(e+""));l.selectedIndex=o.indexOf(e._stateManager.rowsPerPage),l.addEventListener("change",function(){this.setAttribute("aria-label",`showing ${this.value} rows per page`),e._updateRowsPerPage(+this.value)});let r=t.appendChild(document.createElement("div"));r.classList.add("table-page-number-control-container");let i=r.appendChild(document.createElement("div"));i.classList.add("table-page-number-control-block","table-page-number-minus-one"),i.setAttribute("role","button"),i.setAttribute("aria-label","last page"),i.addEventListener("click",function(){e._setPageNumber(e._stateManager.currentPageNumber-1)});let s=r.appendChild(document.createElement("div"));s.classList.add("table-page-number-current-container");let c=s.appendChild(document.createElement("label"));c.appendChild(document.createTextNode("Page"));let d=s.appendChild(document.createElement("input"));d.type="text",d.id=e._targetId+"-table-page-number-current",c.setAttribute("for",d.id),d.setAttribute("aria-label","current page is 1"),d.addEventListener("change",function(){let t=+this.value;isNaN(t)?alert("Invalid page number!"):e._setPageNumber(t)});let u=s.appendChild(document.createElement("label"));u.appendChild(document.createTextNode("of"));let m=s.appendChild(document.createElement("input"));m.type="text",m.id=e._targetId+"-table-page-number-total",u.setAttribute("for",m.id),m.classList.add("table-page-number-total"),m.readonly=!0;let h=e._totalPages();m.value=h,m.setAttribute("aria-label",`all ${h} pages`);let p=r.appendChild(document.createElement("div"));return p.classList.add("table-page-number-control-block"),p.classList.add("table-page-number-plus-one"),p.setAttribute("role","button"),p.setAttribute("aria-label","next page"),p.addEventListener("click",function(){e._setPageNumber(e._stateManager.currentPageNumber+1)}),t}(e)):e._stateManager.rowsPerPage=e._dataManager.cache.totalCount,a.appendChild(n),e._updateTableBodyView().catch(e=>{console.error(e)}),e._configuration.layout.filter&&e._createFilterSection().catch(e=>{console.error(e)})}class b{constructor(e){if("string"!=typeof e)throw"a uid property is required to create the set";this._data=[],this.uid=e}toArray(){return[...this._data]}add(e){for(let t=0;t<this._data.length;t++)if(this._data[t][this.uid]===e[this.uid])return;this._data.push(e)}delete(e){for(let t=0;t<this._data.length;t++)if(this._data[t][this.uid]===e[this.uid])return void this._data.splice(t,1)}size(){return this._data.length}has(e){for(let t of this._data)if(t[this.uid]===e[this.uid])return!0;return!1}}return class{constructor(t,a,n={dataIsComplete:!0}){if("string"!=typeof a||!a)throw new TypeError("target id should be a non-empty string");this._targetId=a,this._dataManager=new r(t,n),this._stateManager=new i,this._columnSetting=new e(this._dataManager.data),this._configuration={caption:"",maxNumOfFacets:50,layout:{download:!1,filter:!1,chart:!1,search:!1,column_selector:!1},firstColumnType:void 0,uidName:"",scheme:"default",schemes:["default","light","dark"],fileName:n.fileName?n.fileName:"data",urlForDownloading:n.urlForDownloading,columnsToDownload:n.columnsToDownload,dataToDownload:n.dataToDownload,stickyHeader:n.stickyHeader,pagination:void 0===n.pagination||n.pagination},this._selectedRows=null,this._uid="my-1535567872393-product"}setRowsPerPage(e){if("number"!=typeof e||e<0)throw new Error("a natural number expected");if(![5,10,20,50,100,200].includes(e))throw`${e} is invalid`;this._stateManager.rowsPerPage=e}setFormatter(e,t){if("string"!=typeof e||!this._columnSetting.colModel[e])throw new Error(`Column name ${e} not recognized.`);if("string"!=typeof t){if("function"!=typeof t)throw new Error("A predefined formatter name or custom function expected.");this._columnSetting.colModel[e].formatter=t}else{let a=c[t];if(!a)throw new Error(`The formatter name ${t} not recognized.`);this._columnSetting.colModel[e].formatter=a}}configureColumn(e,t){this._columnSetting.configureColumn(e,t)}configureLayout(e,t){if("string"!=typeof e)throw"Invalid property: "+e;switch(e.toUpperCase()){case"DOWNLOAD":this._configuration.layout.download=t;break;case"FILTER":this._configuration.layout.filter=t;break;case"CHART":this._configuration.layout.chart=t;break;case"SEARCH":this._configuration.layout.search=t;break;case"COLUMN_SELECTOR":this._configuration.layout.selectColumns=t;break;default:return console.error("Property not recognized!"),void console.error("Expect: download | search | filter | chart | column_selector")}console.log("Configuration updated.")}setOrderedAllColumns(e){this._columnSetting.setOrderedAllColumns(e)}setShownColumns(e){this._columnSetting.setShownColumns(e)}addFilter(e,t="value"){if(!this._columnSetting.shownColumns.includes(e))throw`the column name ${e} is invalid`;this._stateManager.filterStatus[e]=[],this._configuration.layout.filter=!0}setCaption(e){"string"==typeof e&&e.length>0&&(this._configuration.caption=e)}setScheme(e){this._configuration.scheme=e}setFirstColumnType(e,t){if("string"!=typeof e)throw new TypeError("a string expected to set the type of the first column");switch(e.toLowerCase()){case"number":this._configuration.firstColumnType="number";break;case"checkbox":if("object"!=typeof t||!t.uidName)throw"a uid name is required when first column is checkbox";this._configuration.firstColumnType="checkbox",this._configuration.uidName=t.uidName,this._selectedRows=new b(this._configuration.uidName);break;case"image":if(this._configuration.firstColumnType="image","img"!==t.tagName)throw new TypeError("an img element descriptor expected");this._configuration.firstColumnFormatter=t.formatter;break;case"custom":this._configuration.firstColumnType="custom";let a=document.createElement(t.tagName);if("[object HTMLUnknownElement]"===Object.prototype.toString.call(a))throw"invalid tag name to create custom element";this._configuration.firstColumnFormatter=t.formatter;break;default:throw new TypeError("valid types: number, checkbox, image, custom")}}generate(){g(this)}_totalPages(){let e=Math.floor(this._dataManager.cache.totalCount/this._stateManager.rowsPerPage)+1;if(isNaN(e))throw"invalid total page number";return e}_setPageNumber(e){e<1||e>this._totalPages()?alert("Page number out of range!"):(this._stateManager.currentPageNumber=e,this._updateTableBodyView().catch(e=>{console.error(e.message)}))}_updateRowsPerPage(e){this._stateManager.rowsPerPage=e,this._stateManager.currentPageNumber=1,this._updateTableBodyView().catch(e=>{console.error(e.message)})}_sortOnColumn(e,t){this._stateManager.sort={},this._stateManager.sort[e]=t,this._stateManager.currentPageNumber=1,this._updateTableBodyView().catch(e=>{console.error(e.message)})}_filterData(){this._stateManager.currentPageNumber=1,"checkbox"===this._configuration.firstColumnType&&(this._selectedRows=new b(this._configuration.uidName)),this._updateTableBodyView().then(()=>{let e=document.getElementById(this._targetId+"-filter-viz-download-buttons-wrapper");Object.keys(this._stateManager.filter).length?e.classList.add("filter-active"):e.classList.remove("filter-active")}).catch(e=>{console.error(e.message)})}_notifyStatus(e){!function(e,t){let a=document.getElementById(e+"-notification-section"),n=a.getElementsByClassName("message-bar");switch(t.type){case"progress":a.classList.add("progress-active"),a.classList.remove("error-active","alert-active");break;case"error":a.classList.add("error-active"),a.classList.remove("alert-active","progress-active"),n[0].innerText=t.message;break;case"alert":a.classList.add("alert-active"),a.classList.remove("error-active","progress-active"),n[1].innerText=t.message;break;case"success":a.classList.remove("progress-active"),a.classList.remove("error-active","alert-active");break;default:a.classList.remove("progress-active"),a.classList.remove("error-active","alert-active")}}(this._targetId,e)}_updateCheckboxInHeader(e){let t=document.getElementById(`${this._targetId}-table-header-checkbox`),a=0;for(let t of e)this._selectedRows.has(t)&&a++;switch(a){case e.length:t.classList.remove("partial"),t.checked=!0;break;case 0:t.classList.remove("partial"),t.checked=!1;break;default:t.classList.add("partial"),t.checked=!1}}async _updateTableBodyView(){let e=null;try{this._notifyStatus({type:"progress",message:""}),e=(await this._dataManager.serve(this._stateManager.queryObject())).data}catch(e){throw this._notifyStatus({type:"error",message:"failed to load data"}),e}try{!function(e,t,a){for(let t of e._columnSetting.shownColumns)if(e._columnSetting.colModel[t].formatter)if("string"==typeof e._columnSetting.colModel[t].formatter){if(!c(e._columnSetting.colModel[t].formatter))throw new Error("formatter not recognized");e._columnSetting.colModel[t].formatter=c(e._columnSetting.colModel[t].formatter)}else if("function"!=typeof e._columnSetting.colModel[t].formatter)throw new Error("Invalid formatter for "+t);if("string"!=typeof e._targetId||!e._targetId)throw new Error("an element id expected");let n=document.getElementById(e._targetId+"-table-section");if(!n)throw new Error("failed to locate the table");let l=n.getElementsByTagName("tbody")[0];l._data=null,n.removeChild(l);let o=document.createDocumentFragment();(l=o.appendChild(document.createElement("tbody")))._data=t;for(let a=0;a<t.length;a++){let n=t[a],o=l.appendChild(document.createElement("tr"));switch(o._attachedData=n,e._configuration.firstColumnType){case"number":let l=e._stateManager.getStart()+1,r=o.appendChild(document.createElement("td"));r.innerText=l+a,r.classList.add("table-row-index-column");break;case"checkbox":let i=o.appendChild(document.createElement("td"));i.classList.add("table-row-index-column","table-row-checkbox-column");let s=i.appendChild(document.createElement("input"));s.type="checkbox",s.checked=e._selectedRows.has(n),s.id=`${e._targetId}-table-row-checkbox-${a}`,s.classList.add("table-row-checkbox"),s.checked&&o.classList.add("table-row-selected"),s.addEventListener("change",function(){o.classList.toggle("table-row-selected"),s.checked?e._selectedRows.add(n):e._selectedRows.delete(n),e._updateCheckboxInHeader(t)}),i.appendChild(document.createElement("label")).setAttribute("for",s.id)}for(let t of e._columnSetting.shownColumns){let a=o.appendChild(document.createElement("td"));if(e._columnSetting.colModel[t].formatter){let l=e._columnSetting.colModel[t].formatter(n[t]);switch(typeof l){case"string":a.innerHTML=l;break;case"object":a.appendChild(l);break;default:a.innerText="invalid customized formatter"}}else a.innerText=u(n[t]);e._columnSetting.colModel[t].align&&(a.style.textAlign=e._columnSetting.colModel[t].align)}}if("checkbox"===e._configuration.firstColumnType&&e._updateCheckboxInHeader(t),n.appendChild(o),e._configuration.pagination){let t=document.getElementById(e._targetId+"-table-page-number-current");t.value=e._stateManager.currentPageNumber,t.setAttribute("aria-label","current page is "+t.value);let n=document.getElementById(e._targetId+"-table-page-number-total");n.value=a,n.setAttribute("aria-label",`all ${a} pages`)}}(this,e,this._totalPages()),this._notifyStatus({type:"success",message:""})}catch(e){throw this._notifyStatus({type:"error",message:"failed to update the view"}),e}}_updateWholeTableView(){let e=this._targetId+"-table-section",t=document.getElementById(e);t.id=e+"-to-be-removed";let a=f(this);t.parentNode.insertBefore(a,t),t.parentNode.removeChild(t),this._updateTableBodyView().catch(e=>{console.error(e)})}async _createFilterSection(){let e=null;try{e=await this._dataManager.serve({facets:Object.keys(this._stateManager.filterStatus)})}catch(e){throw this._notifyStatus({type:"error",message:"failed to create the filter section"}),e}let t={};for(let a of e)t[a.name]=a.facets;this._stateManager.filterStatus=t;try{!function(e){let t=document.getElementById(e._targetId+"-filter-section");if(!t)throw new Error("Creating filter section failed.");for(;t.lastChild;)t.removeChild(t.lastChild);let a=Object.keys(e._stateManager.filterStatus);if(0===a.length)return void console.error("No filters found.");let n=document.getElementById(e._targetId+"-filter-viz-download-buttons-wrapper");if(0===n.getElementsByClassName("filter-section-control-button").length){let t=n.insertBefore(document.createElement("div"),n.firstElementChild);t.classList.add("table-top-button","filter-section-control-button"),t.appendChild(document.createTextNode("Filters")),t.setAttribute("role","button"),t.setAttribute("aria-label","filter button"),t.addEventListener("click",function(){document.getElementById(e._targetId).classList.toggle("filter-section-active")}),t.classList.add("filter-ready-signal"),setTimeout(function(){t.classList.remove("filter-ready-signal")},2e3)}let l=document.createDocumentFragment(),o=l.appendChild(document.createElement("table"));o.classList.add("filter-section-table");for(let t of a){let a=o.appendChild(document.createElement("tr"));a.classList.add("filter-section-row"),a.filterName=t;let n=a.appendChild(document.createElement("td"));n.classList.add("filter-name"),n.appendChild(document.createTextNode(e._columnSetting.colModel[t].label?e._columnSetting.colModel[t].label:t)),(n=a.appendChild(document.createElement("td"))).classList.add("filter-values"),n.classList.add("unfold-fold-fold");for(let a=0;a<e._stateManager.filterStatus[t].length;a++){let l=e._stateManager.filterStatus[t][a],o=n.appendChild(document.createElement("span"));o.classList.add("filter-value"),a>9&&o.classList.add("filter-value-hidden");let r=o.appendChild(document.createElement("input"));r.type="checkbox";let i=`${e._targetId}-filter-value-${t}-value-${a}`;r.id=i,r.counterpart=l,r.addEventListener("change",function(){this.counterpart.selected=this.checked,e._filterData()});let s=o.appendChild(document.createElement("label"));if(s.setAttribute("for",i),s.appendChild(document.createTextNode(`${l.facetValue} (${l.count})`)),a>e._configuration.maxNumOfFacets-1){let t=n.appendChild(document.createElement("span"));t.classList.add("filter-value-hidden"),t.classList.add("filter-value-overflow-message"),t.innerText="(showing the first 50 items only)",e._notifyStatus({type:"alert",message:"Too many facets, only a partial list is shown in the Filter section"});break}}if(e._stateManager.filterStatus[t].length>10){let e=n.appendChild(document.createElement("span"));e.classList.add("unfold-fold-ctrl"),e.addEventListener("click",function(e){e.target.parentNode.classList.toggle("unfold-fold-fold")})}}t.appendChild(l)}(this)}catch(e){throw e}}}}();