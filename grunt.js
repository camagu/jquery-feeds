/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:feeds.jquery.json>',
    meta: {
      banner: '/*!\n' +
              ' * <%= pkg.title || pkg.name %> v<%= pkg.version %>\n' +
              '<%= pkg.homepage ? " * " + pkg.homepage + "\n" : "" %>' +
              ' * \n' +
              ' * Copyright (c) <%= grunt.template.today("yyyy") %>, <%= pkg.author.name %>\n' +
              ' * Dual licensed under the MIT and GPL licenses:\n' +
              ' *     http://www.opensource.org/licenses/mit-license.php\n' +
              ' *     http://www.gnu.org/licenses/gpl.html\n' +
              ' * \n' +
              ' * Includes a modified version of Simple JavaScript Templating\n' +
              ' * http://ejohn.org/blog/javascript-micro-templating/\n' +
              ' * Copyright (c) John Resig (http://ejohn.org)\n' +
              ' * MIT licensed\n' +
              ' * \n' +
              ' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
              ' */'
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', '<file_strip_banner:src/jquery.feeds.js>'],
        dest: 'jquery.feeds.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'jquery.feeds.min.js'
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        devel: true
      },
      globals: {
        jQuery: true
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit concat min');
};
