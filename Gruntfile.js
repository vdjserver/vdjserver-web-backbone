
'use strict';

var LIVERELOAD_PORT  = 35730;
var SERVER_PORT      = 9001;
var TEST_SERVER_PORT = 9002;

// modRewrite for livereload
var modRewrite = require('connect-modrewrite');

var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};


// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

    // show elapsed time at the end
    require('time-grunt')(grunt);

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);


    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            options: {
                nospawn: true,
                livereload: true
            },
            coffee: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
                tasks: ['coffee:dist']
            },
            coffeeTest: {
                files: ['test/spec/{,*/}*.coffee'],
                tasks: ['coffee:test']
            },
            compass: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.app %>/*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/**/*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                    '<%= yeoman.app %>/templates/**/*.html',
                    'test/spec/**/*.js'
                ]
            }
        },
        connect: {
            options: {
                port: SERVER_PORT,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function(connect) {

                        return [
                            modRewrite([
                                '!\\.eot|\\.svg|\\.otf|\\.jpg|\\.ttf|\\.ico|\\.woff|\\.html|\\.js|\\.css|\\.png$ /index.html [L]'
                            ]),
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: TEST_SERVER_PORT,
                    middleware: function(connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function(connect) {
                        return [
                            mountFolder(connect, yeomanConfig.dist)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },



        bower: {
            all: {
                rjsConfig: '<%= yeoman.app %>/scripts/requirejs-config.js'
            }
        },
        clean: {
            dist: ['.tmp', '<%= yeoman.dist %>/*'],
            server: '.tmp'
        },
        coffee: {
            dist: {
                files: [{
                    // rather than compiling multiple files here you should
                    // require them into your main .coffee file
                    expand: true,
                    cwd: '<%= yeoman.app %>/scripts',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/scripts',
                    ext: '.js'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test/spec',
                    src: '*.coffee',
                    dest: '.tmp/spec',
                    ext: '.js'
                }]
            }
        },
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/styles',
                cssDir: '.tmp/styles',
                imagesDir: '<%= yeoman.app %>/images',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '/fonts',
                importPath: '<%= yeoman.app %>/bower_components',
                httpImagesPath: '/images',
                relativeAssets: true
            },
            dist: {},
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            bootstrapDev: {
                src: [
                    '<%= yeoman.app %>/bower_components/twbs-bootstrap-sass/vendor/assets/javascripts/bootstrap/affix.js',
                    '<%= yeoman.app %>/bower_components/twbs-bootstrap-sass/vendor/assets/javascripts/bootstrap/alert.js',
                    '<%= yeoman.app %>/bower_components/twbs-bootstrap-sass/vendor/assets/javascripts/bootstrap/button.js',
                    '<%= yeoman.app %>/bower_components/twbs-bootstrap-sass/vendor/assets/javascripts/bootstrap/carousel.js',
                    '<%= yeoman.app %>/bower_components/twbs-bootstrap-sass/vendor/assets/javascripts/bootstrap/collapse.js',
                    '<%= yeoman.app %>/bower_components/twbs-bootstrap-sass/vendor/assets/javascripts/bootstrap/dropdown.js',
                    '<%= yeoman.app %>/bower_components/twbs-bootstrap-sass/vendor/assets/javascripts/bootstrap/tab.js',
                    '<%= yeoman.app %>/bower_components/twbs-bootstrap-sass/vendor/assets/javascripts/bootstrap/transition.js',
                    '<%= yeoman.app %>/bower_components/twbs-bootstrap-sass/vendor/assets/javascripts/bootstrap/scrollspy.js',
                    '<%= yeoman.app %>/bower_components/twbs-bootstrap-sass/vendor/assets/javascripts/bootstrap/modal.js',
                    '<%= yeoman.app %>/bower_components/twbs-bootstrap-sass/vendor/assets/javascripts/bootstrap/tooltip.js',
                    '<%= yeoman.app %>/bower_components/twbs-bootstrap-sass/vendor/assets/javascripts/bootstrap/popover.js'
                ],
                dest: '<%= yeoman.app %>/scripts/vendor/bootstrap.js'
            },
            dist: {
                '<%= yeoman.dist %>/scripts/main.js': [
                    '<%= yeoman.dist %>/scripts/main.js',
                    '<%= yeoman.dist %>/scripts/templates.js'
                ]
            }
        },
        copy: {
            prepareFonts: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        flatten: true,
                        cwd: '<%= yeoman.app %>',
                        dest: '<%= yeoman.app %>/fonts/font-awesome',
                        src: [
                            'bower_components/font-awesome/fonts/*'
                        ]
                    }
                ]
            },
            distImages: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        cwd: '<%= yeoman.app %>/bower_components',
                        dest: '<%= yeoman.dist %>/images',
                        src: [
                            '{,*/}*.{png,jpg,jpeg,gif}'
                        ]
                    }
                ]
            },
            distStyles: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        flatten: true,
                        cwd: '<%= yeoman.app %>/bower_components',
                        dest: '.tmp/styles',
                        src: [
                            /*
                             * Bower styles can all go here!
                             * e.g.
                             *'jcrop/css/jquery.Jcrop.css'
                             */
                            'nvd3/nv.d3.css'
                        ]
                    }
                ]
            },
            distBower: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        flatten: true,
                        cwd: '<%= yeoman.app %>/bower_components',
                        dest: '<%= yeoman.dist %>/scripts/vendor',
                        src: [
                            'modernizr/modernizr.js',
                            'moment/moment.js'
                        ]
                    }
                ]
            },
            distBootstrap: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        flatten: true,
                        cwd: '<%= yeoman.app %>/scripts/vendor',
                        dest: '<%= yeoman.dist %>/scripts/vendor',
                        src: [
                            'bootstrap.js'
                        ]
                    }
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= yeoman.app %>',
                        dest: '<%= yeoman.dist %>',
                        src: [
                            '*.{ico,txt}',
                            '.htaccess',
                            'images/{,*/}*.{webp,gif}',
                            'fonts/**',
                            'templates/**',
                            //'bower_components/font-awesome/fonts/*'
                        ]
                    }
                ]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/main.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= yeoman.app %>/styles/{,*/}*.css'
                    ]
                }
            }
        },
        handlebars: {
            compile: {
                options: {
                    namespace: 'JST',
                    processName: function(filename) {
                        return filename.substr(4);
                    }
                },
                files: {
                    '<%= yeoman.dist %>/scripts/templates.js': ['<%= yeoman.app %>/templates/**/*.html']
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/images',
                        dest: '<%= yeoman.dist %>/images',
                        src: '{,*/}*.{png,jpg,jpeg}'
                    },
                    {
                        expand: true,
                        flatten: true,
                        cwd: '<%= yeoman.app %>/bower_components',
                        dest: '<%= yeoman.dist %>/images',
                        src: [
                            /*
                             * Bower images can all go here!
                             * e.g.
                             * 'bootstrap-calendar/img/*.{png,jpg,jpeg,gif}',
                             */
                        ]
                    }
                ]
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '{.tmp,<%= yeoman.app %>}/scripts/**/*.js',
                '!<%= yeoman.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    reporter: 'Spec',
                    urls: ['http://localhost:<%= connect.options.port %>/test/index.html']
                }
            }
        },
        requirejs: {
            dist: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    // `name` and `out` is set by grunt-usemin
                    baseUrl: '<%= yeoman.app %>/scripts',
                    optimize: 'none',
                    paths: {
                        'templates': '../../.tmp/scripts/templates'
                    },
                    // TODO: Figure out how to make sourcemaps work with grunt-usemin
                    // https://github.com/yeoman/grunt-usemin/issues/30
                    //generateSourceMaps: true,
                    // required to support SourceMaps
                    // http://requirejs.org/docs/errors.html#sourcemapcomments
                    preserveLicenseComments: false,
                    useStrict: true
                    //uglify2: {} // https://github.com/mishoo/UglifyJS2
                }
            }
        },
        /* Note: this isn't working yet
        uglify: {
            'dist/scripts/vendor/bootstrap.js': ['dist/scripts/vendor/bootstrap.js']
        },
        */
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                assetsDirs: ['<%= yeoman.dist %>','<%= yeoman.dist %>/images']
            }
        }
    });

    grunt.registerTask('server', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        if (target === 'test') {
            return grunt.task.run([
                'clean:server',
                'coffee',
                'compass:server',
                'connect:test',
            ]);
        }

        grunt.task.run([
            'clean:server',
            'concat:bootstrapDev',
            'copy:prepareFonts',
            'coffee:dist',
            'compass:server',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'coffee',
        'compass',
        'connect:test',
        'mocha',
        'watch:test'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'coffee',
        'concat:bootstrapDev',
        'copy:prepareFonts',
        'copy:distBootstrap',
        'copy:distStyles',
        'copy:distBower',
        'copy:distImages',
        'compass',
        'handlebars',
        'useminPrepare',
        'requirejs',
        'imagemin',
        'htmlmin',
        'concat:dist',
        'cssmin',
        'uglify',
        'copy:dist',
        'usemin'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);
};
