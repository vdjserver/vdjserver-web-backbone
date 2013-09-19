/**
  * Backbone VDJ
  * Version 0.0.1
  *
  */
(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    var Agave = Backbone.Agave;
    var Vdj = {};

    Vdj.Model = Agave.Model.extend({
        apiRoot: Agave.vdjApiRoot
    });

    Vdj.Collection = Agave.Collection.extend({
        apiRoot: Agave.vdjApiRoot
    });

    Backbone.Vdj = Vdj;
    return Vdj;

})(this);
