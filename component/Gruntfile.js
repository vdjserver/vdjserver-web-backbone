
'use strict';

var LIVERELOAD_PORT  = 35730;
var SERVER_PORT      = 9001;
var TEST_SERVER_PORT = 9002;

// modRewrite for livereload
var modRewrite = require('connect-modrewrite');

var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function(connect, dir) {
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
        dist: 'dist',
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
            sass: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['sass:dev']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.app %>/*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/**/*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= yeoman.app %>/templates/**/*.html',
                    'test/spec/**/*.js'
                ]
            }
        },
        connect: {
            options: {
                port: SERVER_PORT,
                // change this to '0.0.0.0' to access the server from outside
                //hostname: 'localhost'
                hostname: process.env.HOSTNAME || 'localhost'
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
                            mountFolder(connect, 'test'),
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app),
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
        jscs: {
            src: [
                '<%= yeoman.app %>/scripts/*',
                '!<%= yeoman.app %>/scripts/vendor/**',
            ],
            options: {
                config: '.jscsrc',
            },
        },
        open: {
            server: {
                //path: 'http://localhost:<%= connect.options.port %>'
                path: 'http://' + (process.env.HOSTNAME || 'localhost') + ':<%= connect.options.port %>'
            }
        },

        bower: {
            all: {
                rjsConfig: '<%= yeoman.app %>/scripts/requirejs-config.js'
            }
        },
        clean: {
            dist: ['.tmp', '<%= yeoman.dist %>/*'],
            server: '.tmp',
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
        sass: {
            dev: {
                options: {
                    style: 'compact',
                    compass: true,
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/styles',
                        src: ['*.{scss,sass}'],
                        dest: '.tmp/styles',
                        ext: '.css',
                    },
                ],
            },
            dist: {
                options: {
                    style: 'compact',
                    compass: true,
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/styles',
                        src: ['*.{scss,sass}'],
                        dest: '.tmp/styles',
                        ext: '.css',
                    }
                ],
            },
        },
        concat: {
            options: {
                separator: ';',
            },
            dev: {
                files: [
                    {
                        '.tmp/styles/charts.css': [
                            '.tmp/styles/charts/*.css',
                            '.tmp/styles/charts.css',
                        ],
                    },
                    {
                        '.tmp/styles/main.css': [
                            '.tmp/styles/main/*.css',
                            '.tmp/styles/main.css',
                        ],
                    },
                ],
            },
            dist: {
                files: [
                    {
                        '<%= yeoman.dist %>/scripts/main.js': [
                            '<%= yeoman.dist %>/scripts/main.js',
                            '<%= yeoman.dist %>/scripts/templates.js',
                        ],
                    },
                    {
                        '.tmp/styles/charts.css': [
                            '.tmp/styles/charts/*.css',
                            '.tmp/styles/charts.css',
                        ],
                    },
                    {
                        '.tmp/styles/main.css': [
                            '.tmp/styles/main/*.css',
                            '.tmp/styles/main.css',
                        ],
                    },
                ],
            },
        },
        copy: {
            environmentConfig: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        flatten: true,
                        cwd: '<%= yeoman.app %>',
                        dest: '<%= yeoman.app %>/scripts/config',
                        src: [
                            '../../docker/environment-config/environment-config.js'
                        ]
                    }
                ]
            },
            airr: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        flatten: true,
                        cwd: '<%= yeoman.app %>',
                        dest: '<%= yeoman.app %>/scripts/config/',
                        src: [
                            '../../airr-standards/specs/airr-schema.yaml'
                        ],
                        rename: function(dest, src) {
                          return dest + src.replace('.yaml','.yaml.html');
                        }
                    }
                ]
            },
            fontAwesome: {
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
            bowerImages: {
                files: [
                    {
                        expand: true,
                        dot:true,
                        flatten: true,
                        cwd: '<%= yeoman.app %>/bower_components',
                        dest: '<%= yeoman.dist %>/images',
                        src: [
                            'datatables/media/images/*',
                            'twbs-bootstrap-sass/assets/images/*',
                        ]
                    }
                ]
            },
            bowerCss: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        flatten: true,
                        cwd: '<%= yeoman.app %>/bower_components',
                        dest: '.tmp/styles/main',
                        src: [
                            /*
                             * Bower styles can all go here!
                             * e.g.
                             *'jcrop/css/jquery.Jcrop.css'
                             */
                            'nvd3/nv.d3.css',
                            'datatables/media/css/jquery.dataTables.min.css',
                            'datatables-responsive/css/dataTables.responsive.css',
                            'animate.css/animate.css',
                        ],
                    },
                    {
                        expand: true,
                        dot: true,
                        flatten: true,
                        cwd: '<%= yeoman.app %>/bower_components',
                        dest: '.tmp/styles/charts',
                        src: [
                            /*
                             * Bower styles can all go here!
                             * e.g.
                             *'jcrop/css/jquery.Jcrop.css'
                             */
                            'nvd3/nv.d3.css',
                        ],
                    },
                ],
            },
            bowerFonts: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        flatten: true,
                        cwd: '<%= yeoman.app %>/bower_components',
                        dest: '<%= yeoman.dist %>/fonts',
                        src: [
                            'twbs-bootstrap-sass/assets/fonts/bootstrap/**',
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
                            'scripts/config/**',
                        ],
                    },
                ],
            },
        },
        cssmin: {
            dist: {
                files: [
                    {
                        '<%= yeoman.dist %>/styles/main.css': [
                            '.tmp/styles/main.css',
                        ],
                    },
                    {
                        '<%= yeoman.dist %>/styles/charts.css': [
                            '.tmp/styles/charts.css',
                        ],
                    },
                ],
            },
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
                        src: '{,*/}*.{png,jpg,jpeg,svg,gif}'
                    },
                    {
                        expand: true,
                        flatten: false,
                        cwd: '<%= yeoman.app %>/bower_components',
                        dest: '<%= yeoman.dist %>/bower_components',
                        src: [
                            /*
                             * Bower images can all go here!
                             * e.g.
                             * 'bootstrap-calendar/img/*.{png,jpg,jpeg,gif}',
                             */
                            'bootstrap/img/*.{png,jpg,jpeg,gif}',
                        ]
                    }
                ]
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish'),
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
                    run: false,
                    reporter: 'Spec',
                    urls: ['http://localhost:' + TEST_SERVER_PORT + '/index.html'],
                    log: true,
                    logErrors: true,
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
                        'templates': '../../.tmp/scripts/templates',
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
                assetsDirs: [
                    '<%= yeoman.dist %>',
                    '<%= yeoman.dist %>/images',
                ]
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
                'connect:test',
            ]);
        }

        grunt.task.run([
            'clean:server',
            'copy:fontAwesome',
            'copy:bowerCss',
            'copy:environmentConfig',
            'copy:airr',
            'coffee:dist',
            'sass:dev',
            'concat:dev',
            'connect:livereload',
            'open',
            'watch',
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'coffee',
        'copy:environmentConfig',
        'connect:test',
        //'mocha',
        //'watch:test',
        'watch'
    ]);

    grunt.registerTask('lint', [
        'jshint',
        'jscs',
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'coffee',
        'copy:fontAwesome',
        'copy:bowerCss',
        'copy:bowerImages',
        'copy:bowerFonts',
        'copy:airr',
        'sass:dist',
        'handlebars',
        'copy:dist',
        'useminPrepare',
        'requirejs',
        'imagemin',
        'htmlmin',
        'concat:dist',
        'cssmin',
        'uglify',
        'usemin',
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build',
    ]);
};
