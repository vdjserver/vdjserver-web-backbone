define(['app'], function(App){
  var AgaveApps = {};

  AgaveApps.AppView = Backbone.View.extend({
    template: 'apps/view',
    initialize: function() {
      this.model.on('change', this.render, this);
      if (! this.model.collection) {
        this.model.fetch();
      }
    },
    serialize: function() {
      json = this.model.toJSON();
      if (this.model.collection) {
        json.hasCollection = true;
      }
      return json;
    },
    events: {
      'click .back-to-list': 'backToCollection',
      'click .btn-show-form': 'showForm'
    },
    backToCollection: function(e) {
      e.preventDefault();
      this.remove();
      return false;
    },
    showForm: function(e) {
      if (App.Agave.token().isValid()) {
        new AgaveApps.AppForm({
          model: this.model,
          el: this.$el.find('.app-form')
        }).render();
        $(e.target).hide();
      } else {
        alert('You must be logged in to use applications.');
      }
    }
  });

  AgaveApps.AppForm = Backbone.View.extend({
    template: 'apps/form',
    events: {
      'click .btn-primary': 'submitForm'
    },
    beforeRender: function() {

      var sorter = function(o) { return o.id; },
        params = _.sortBy(this.model.get('parameters'), sorter),
        inputs = _.sortBy(this.model.get('inputs'), sorter),
        // outputs = _.sortBy(this.model.get('outputs'), sorter),
        fieldset, i;

      if (params && params.length > 0) {
        fieldset = new App.Views.FormViews.Fieldset({
          className: 'parameters',
          model: new App.Models.FormModel({
            legend: 'Parameters'
          })
        });

        for (i = 0; i < params.length; i++) {
          var param = params[i];
          if (param.value.visible) {
            var model = new App.Models.FormModel({
              id: param.id,
              name: param.id,
              label: param.details.label,
              help: param.details.description === '' ? null : param.details.description,
              defaultValue: param.defaultValue,
              required: param.value.required
            });

            switch (param.value.type) {
            case 'bool':
              model.set('defaultValue', param.defaultValue === 'true');
              fieldset.insertView(new App.Views.FormViews.Checkbox({model: model}));
              break;

            case 'string':
              var regexp = /^([^|]+[|])+[^|]+$/;
              if (regexp.test(param.value.validator)) {
                model.set('options', param.value.validator.split('|'));
                fieldset.insertView(new App.Views.FormViews.Select({model: model}));
              } else {
                fieldset.insertView(new App.Views.FormViews.Text({model: model}));
              }
              break;

            default:
              fieldset.insertView(new App.Views.FormViews.Text({model: model}));
            }
          }
        }
        this.insertView('.form-fields', fieldset);
      }

      if (inputs && inputs.length > 0) {
        fieldset = new App.Views.FormViews.Fieldset({
          className: 'inputs',
          model: new App.Models.FormModel({
            legend: 'Input files'
          })
        });

        for (i = 0; i < inputs.length; i++) {
          fieldset.insertView(new App.Views.AgaveIO.FileChooser({
            model: new App.Models.FormModel({
              id: inputs[i].id,
              name: inputs[i].id,
              label: inputs[i].details.label,
              help: inputs[i].details.description === '' ? null : inputs[i].details.description,
              defaultValue: inputs[i].defaultValue,
              required: inputs[i].value.required
            })
          }));
        }
        this.insertView('.form-fields', fieldset);
      }

      // if (outputs && outputs.length > 0) {
      //   fieldset = new App.Views.FormViews.Fieldset({
      //     className: 'outputs',
      //     model: new App.Models.FormModel({
      //       legend: 'Output files'
      //     })
      //   });

      //   for (i = 0; i < outputs.length; i++) {
      //     fieldset.insertView(new App.Views.FormViews.File({
      //       model: new App.Models.FormModel({
      //         id: outputs[i].id,
      //         name: outputs[i].id,
      //         label: outputs[i].details.label,
      //         help: outputs[i].details.description === '' ? null : outputs[i].details.description,
      //         defaultValue: outputs[i].defaultValue,
      //         required: outputs[i].value.required
      //       })
      //     }));
      //   }
      //   this.insertView('.form-fields', fieldset);
      // }

      fieldset = new App.Views.FormViews.Fieldset({
        className: 'metadata',
        model: new App.Models.FormModel({legend: 'Job Info'})
      });
      fieldset.insertView(new App.Views.FormViews.Text({
        model: new App.Models.FormModel({
          id: 'jobName',
          name: 'jobName',
          label: 'Job name',
          required: true,
          defaultValue: this.model.get('name') + '-' + moment().unix(),
          help: 'Provide a name for this job'
        })
      }));
      fieldset.insertView(new App.Views.FormViews.Text({
        model: new App.Models.FormModel({
          id: 'requestedTime',
          name: 'requestedTime',
          label: 'Requested wall time',
          required: true,
          defaultValue: '00:01:00',
          help: 'Enter your requested Wall Time (hh:mm:ss)'
        })
      }));
      this.insertView('.form-fields', fieldset);
    },
    submitForm: function(e) {
      e.preventDefault();
      var form = $(e.currentTarget).closest('form');
      var params = $('.parameters', form).serializeArray(),
        inputs = $('.inputs', form).serializeArray(),
        // outputs = $('.outputs', form).serializeArray(),
        job = {},
        i;
      if (params.length > 0) {
        for (i = 0; i < params.length; i++) {
          if (params[i].value !== '') {
            job[params[i].name] = params[i].value;
          }
        }
      }
      if (inputs.length > 0) {
        for (i = 0; i < inputs.length; i++) {
          if (inputs[i].value !== '') {
            job[inputs[i].name] = inputs[i].value;
          }
        }
      }
      // if (outputs.length > 0) {
      //   for (i = 0; i < outputs.length; i++) {
      //     if (outputs[i].value !== '') {
      //       job[outputs[i].name] = outputs[i].value;
      //     }
      //   }
      // }
      job.jobName = form[0].jobName.value;
      job.softwareName = this.model.id;
      job.requestedTime = form[0].requestedTime.value;
      // todo?
      job.archive = true;
      job.archivePath = '/' + App.Agave.token().get('username') + '/' + job.jobName;
      var appJob = new Backbone.Agave.Jobs.Job();
      appJob.save(job, {
        success: function() {
          alert('success');
        }
      });
      return false;
    }
  });

  AgaveApps.AppList = Backbone.View.extend({
    template: 'apps/list',
    initialize: function() {
      this.collection.on('reset', this.render, this);
      this.collection.fetch({reset:true});
    },
    serialize: function() {
      return {apps: this.collection.toJSON()};
    },
    events: {
      'click .view-app': 'viewApplication'
    },
    viewApplication: function(e) {
      e.preventDefault();
      var models = this.collection.where({id: e.target.dataset.id});
      if (models) {
        var view = new AgaveApps.AppView({model: models[0]});
        App.Layouts.main.setView('.content', view);
        view.render();
        App.router.navigate('#apps/' + models[0].id);
        $('html,body').animate({scrollTop:view.$el.position().top - 100});
      }
      return false;
    }
  });

  App.Views.AgaveApps = AgaveApps;
  return AgaveApps;
});
