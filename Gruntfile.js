// Generated on 2013-07-16 using generator-angular 0.3.0
'use strict';



// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
 
  // configurable paths


  grunt.initConfig({
    config : {
      app: 'app',
      build: 'build'
    },
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '.tmp',
              '<%= config.build %>/*'
            ]
          }
        ]
      }
    },
    jasmine_node: {
      //coverage: {
      //},
      specNameMatcher: "Spec", // load only specs containing specNameMatcher
      projectRoot: ".",
      requirejs: false,
      forceExit: true,
      jUnit: {
        report: true,
        savePath : "./build/reports/jasmine/",
        useDotNotation: true,
        consolidate: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-jasmine-node');
  //grunt.loadNpmTasks('grunt-jasmine-node-coverage');

  grunt.registerTask('test', [
    'jasmine_node',
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'jasmine_node'
  ]);

  grunt.registerTask('default', ['build']);

};
