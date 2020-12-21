// //
// // community-controller.js
// // Manages all the public project views
// //
// // VDJServer Analysis Portal
// // Web Interface
// // https://vdjserver.org
// //
// // Copyright (C) 2020 The University of Texas Southwestern Medical Center
// //
// // Author: Scott Christley <scott.christley@utsouthwestern.edu>
// // Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
// //
// // This program is free software: you can redistribute it and/or modify
// // it under the terms of the GNU Affero General Public License as published
// // by the Free Software Foundation, either version 3 of the License, or
// // (at your option) any later version.
// //
// // This program is distributed in the hope that it will be useful,
// // but WITHOUT ANY WARRANTY; without even the implied warranty of
// // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// // GNU Affero General Public License for more details.
// //
// // You should have received a copy of the GNU Affero General Public License
// // along with this program.  If not, see <https://www.gnu.org/licenses/>.
// //
//
// import Marionette from 'backbone.marionette';
// import Handlebars from 'handlebars';
//
// import Project from 'Scripts/models/agave-project';
// import ProjectList from 'Scripts/collections/agave-public-projects';
// import ProjectListView from 'Scripts/views/project/project-summary';
// import ProjectPageView from 'Scripts/views/project/project-single';
// import LoadingView from 'Scripts/views/utilities/loading-view';
//
// // Community controller
// //
// // this manages displaying project content
// import community_list_template from 'Templates/project/community-list.html';
// var CommunityListView = Marionette.View.extend({
//     template: Handlebars.compile(community_list_template),
//
//     // one region for the project content
//     regions: {
//         statsRegion: '#community-statistics',
//         queryRegion: '#community-query',
//         projectRegion: '#community-project',
//     },
//
//     initialize(options) {
//         console.log('Initialize');
//         this.projectList = null;
//         this.currentProject = null;
//     },
//
//     // show a loading view, used while fetching the data
//     showLoading() {
//         this.showChildView('projectRegion', new LoadingView({}));
//     },
//
//     // displaying intro text before Project List
//     showIntro: function() {
//         // create view for intro text
//
//         var that = this;
//         var introView = new IntroView({});
//         that.showChildView('introRegion', introView);
//     },
//
//     showProjectList(projectList) {
//         console.log(this.controller);
//         var view = new ProjectListView({collection: projectList, controller: this.controller});
//         this.showChildView('projectRegion', view);
//     },
//
//     showProjectPage(project, page) {
//         this.clearIntroView();
//         console.log(this.controller, isNew);
//         var view = new ProjectPageView({model: project, page: page, controller: this.controller});
//         this.showChildView('projectRegion', view);
//     },
//
// });
//
// //
// // Project controller
// // manages all the different project views
// //
// function CommunityController() {
//     // the project view
//     this.projectView = new CommunityListView({controller: this});
//
//     // maintain state across multiple views
//     this.projectList = null;
//     this.currentProject = null;
// };
//
// CommunityController.prototype = {
//     // return the main view, create it if necessary
//     getView() {
//         if (!this.projectView)
//             this.projectView = new CommunityListView({controller: this});
//         else if (this.projectView.isDestroyed())
//             this.projectView = new CommunityListView({controller: this});
//         return this.projectView;
//     },
//
//     // show list of public projects
//     showProjectList() {
//         if (! this.projectList) {
//             this.projectList = new ProjectList();
//
//             var that = this;
//
//             // show a loading view while fetching the data
//             this.projectView.showLoading();
//
//             // load the projects
//             this.projectList.fetch()
//             .then(function() {
//                 console.log(that.projectList);
//                 // have the view display them
//                 that.projectView.showProjectList(that.projectList);
//             })
//             .fail(function(error) {
//                 console.log(error);
//             });
//         } else {
//             // projects already loaded
//             // have the view display them
//             this.projectView.showProjectList(this.projectList);
//         }
//     },
//
//     showProjectPage(projectUuid, page) {
//         // clear the current project
//         this.currentProject = null;
//
//         // if project list is loaded, get from list
//         if (this.projectList) {
//             this.currentProject = this.projectList.get(projectUuid);
//             if (! this.currentProject) {
//                 // Not in list,
//                 // maybe list is out of date, so clear it
//                 this.projectList = null;
//             }
//         }
//
//         // If no project then fetch it
//         if (! this.currentProject) {
//             this.currentProject = new Project({uuid: projectUuid});
//             var that = this;
//             this.currentProject.fetch()
//             .then(function() {
//                 console.log(that.currentProject);
//
//                 // have the view display it
//                 that.projectView.showProjectPage(that.currentProject, page);
//             })
//             .fail(function(error) {
//                 // TODO: could not retrieve project
//                 // maybe the user does not have access, or the uuid is wrong
//                 // need to display some error message
//                 console.log(error);
//             });
//         } else {
//             // have the view display it
//             this.projectView.showProjectPage(this.currentProject, page);
//         }
//     },
//
// };
// export default CommunityController;
