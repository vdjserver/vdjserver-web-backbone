define(['backbone'], function(Backbone) {

  'use strict';

  var Communities = {};

  Communities = Backbone.Agave.MetadataCollection.extend({
    model: Backbone.Agave.Model.Community,

    apiRoot: 'http://localhost:9001',
    // url: '/community'
    url: '/data/community.json'
  });

  Backbone.Agave.Collection.Communities = Communities;
  return Communities;
});
