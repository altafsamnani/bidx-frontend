module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    // Task configuration.
    clean: {
      dist: ['dist']
    },

    less: {
      production: {
        options: {
          paths: ["apps/*/static/less/*.less"],
          cleancss: true,
        },
        files: {
          "static/css/<%= pkg.name %>.css": "static/less/bidx.less"
        }
      }
    , admin: {
        options: {
          paths: ["admin/*/static/less/*.less"],
          cleancss: true,
        },
        files: {
          "static/css/<%= pkg.name %>-admin.css": "static/less/bidx-admin.less"
        }
      }
    },

    watch: {
      less: {
        files: [ 'static/less/**/*.less', 'apps/*/static/less/*.less', '!static/less/bidx_newtheme.less', 'admin/*/static/less/*.less' ],
        tasks: ['less']
      }
    },
    
  });


  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');

  // CSS distribution task.
  // grunt.registerTask('dist-css', ['recess']);

  // Full distribution task.
  grunt.registerTask('dist', ['clean', 'less', 'watch']);

  // Default task.
  grunt.registerTask('default', ['dist']);
};
