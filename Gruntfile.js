module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		assemble: {
			options: {
				flatten: true,
			},
			pages: {
				files: {
					'dist/': ['content/*.md']
				},
			},
		},
	});

	grunt.loadNpmTasks('assemble');

	grunt.registerTask('default', ['assemble']);
};