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

    recess: {
      options: {
        compile: true
      },
      bidx: {
        src: ['static/less/bidx.less', 'apps/*/static/less/*.less' ],
        dest: 'static/css/<%= pkg.name %>.css'
      },
      min: {
        options: {
          compress: true
        },
        src: ['static/less/bidx.less', 'apps/*/static/less/*.less' ],
        dest: 'static/css/<%= pkg.name %>.min.css'
      },
      groups: {
        expand: true,
        ext: ".css",
        flatten: true,
        src: [ 'static/less/groups/*.less', '!static/less/groups/groupbase.less' ],
        dest: 'static/css/groups/'
      },
      groups_min: {
        options: {
          compress: true
        },
        expand: true,
        ext: ".min.css",
        flatten: true,
        src: [ 'static/less/groups/*.less', '!static/less/groups/groupbase.less' ],
        dest: 'static/css/groups/'
      }
    },

    watch: {
      recess: {
        files: [ 'static/less/**/*.less', 'apps/*/static/less/*.less' ],
        tasks: ['recess']
      }
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-recess');

  // CSS distribution task.
  grunt.registerTask('dist-css', ['recess']);

  // Full distribution task.
  grunt.registerTask('dist', ['clean', 'dist-css']);

  // Default task.
  grunt.registerTask('default', ['dist']);
};
