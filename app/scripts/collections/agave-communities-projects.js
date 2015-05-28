define(['backbone'], function(Backbone) {

  'use strict';

  var CommunitiesProjects = {};

  CommunitiesProjects = Backbone.Agave.MetadataCollection.extend({
    model: Backbone.Agave.Model.CommunityProject,

    apiRoot: 'http://localhost:9001',
    // url: '/community'
    url: '/data/community-project.json'
  });

  Backbone.Agave.Collection.CommunitiesProjects = CommunitiesProjects;
  return CommunitiesProjects;
});
