module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		assemble: {
			options: {
				assets: 'dist',
				flatten: true,
				layout: "templates/default.hbs",
			},
			pages: {
				files: {
					'dist/': ['content/*.md']
				},
			},
		},
		copy: {
			assets: {
				expand: true,
				cwd: 'templates',
				src: ['**', '!*.hbs'],
				dest: 'dist/'
			}
		},
		watch: {
			everything: {
				files: ['templates/**', 'content/**'],
				tasks: ['default'],
				options: {
					livereload: true
				},
			},
		},
		connect: {
			server: {
				options: {
					port: 3000,
					base: 'dist/',
					keepalive: true,
					livereload: true,
				}
			}
		},
	});

	grunt.loadNpmTasks('assemble');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['copy:assets', 'assemble']);
};