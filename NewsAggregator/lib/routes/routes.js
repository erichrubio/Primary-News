Router.configure({
  layoutTemplate: 'layout',
  addTemplate: 'addTemplate'
});

Router.route('/', {name: 'articleList'});

Router.route('/add', {
  name: 'addTemplate'
});
