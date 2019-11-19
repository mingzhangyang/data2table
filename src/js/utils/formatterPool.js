const pool = {
  highlight: function(s) {
    return `<mark>${s}</mark>`;
  },
  addLink: function(obj) {
    return `<a href="${obj.link}">${obj.text}</a>`;
  },
  bold: function(word) {
    return `<strong>${word}</strong>`;
  },
  colorText: function(obj) {
    return `<span style="color: ${obj.color}">${obj.text}</span>`;
  },
};

export default function formatterPool(type) {
  return pool[type];
};
 