import { Agave } from 'backbone-agave';
import Project from 'agave-project';
import { Comparators } from 'comparators-mixin';

export default Agave.MetadataCollection.extend(
    _.extend({}, Comparators.reverseChronologicalCreatedTime, {
        model: Project,
        apiHost: EnvironmentConfig.vdjGuest.hostname,
        requiresAuth: false,
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"publicProject"}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ;
        },
    })
);
