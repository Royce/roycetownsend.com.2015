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
	});

	grunt.loadNpmTasks('assemble');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['copy:assets', 'assemble']);
};