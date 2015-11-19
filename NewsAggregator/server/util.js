Meteor.methods({
  findPeople: function (document) {
    var nlp = Meteor.npmRequire('nlp_compromise');
    var people = nlp.pos(document).people();
    return people;
  }
});
