define(['app'], function(App){
    'use strict';

    var FormViews = {};

    FormViews.Field = Backbone.View.extend({
        attributes: function() {
            var classes = ['control-group'];
            if (this.model.get('required')) {
                classes.push('param-required');
            }
            return {
                'class': classes.join(' ')
            };
        },
        beforeRender: function() {
            var help = this.model.get('help');
            if (help) {
                this.insertView('.controls', new FormViews.Help({help: this.model.get('help')}));
            }
        },
        serialize: function() {
            return this.model.toJSON();
        }
    });

    FormViews.Help = Backbone.View.extend({
        template: 'forms/help',
        tagName: 'span',
        className: 'help-inline',
        attributes: function() {
            return {
                title: this.options.help
            };
        },
        serialize: function() {
            return this.options;
        },
        afterRender: function() {
            this.$el.tooltip({placement: 'right'});
        }
    });

    FormViews.Text = FormViews.Field.extend({
        template: 'forms/text'
    });

    FormViews.Checkbox = FormViews.Field.extend({
        template: 'forms/checkbox'
    });

    FormViews.Select = FormViews.Field.extend({
        template: 'forms/select',
        serialize: function() {
            var json = this.model.toJSON(),
                opts = json.options;
            json.options = [];
            for (var i = 0; i < opts.length; i++) {
                json.options.push({
                    option: opts[i],
                    defaultValue: this.model.get('defaultValue') === opts[i]
                });
            }
            return json;
        }
    });

    FormViews.File = FormViews.Field.extend({
        template: 'forms/file'
    });

    FormViews.Fieldset = Backbone.View.extend({
        template: 'forms/fieldset',
        tagName: 'fieldset',
        serialize: function() {
            return this.model.toJSON();
        }
    });

    App.Views.FormViews = FormViews;
    return FormViews;
});
