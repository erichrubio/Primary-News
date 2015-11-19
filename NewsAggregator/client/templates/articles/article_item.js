Template.articleItem.events({
  "click": function (event, template) {
    var win = window.open(template.data.url, '_blank');
    win.focus();
  }
});

Template.trashCan.events({
  "click": function (event, template) {
    Articles.remove(template.data._id);
  }
});
