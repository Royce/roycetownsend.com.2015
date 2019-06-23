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
				expand: true,
				cwd: 'content',
				src: ['**/*.md'],
				dest: 'dist/',
			},
		},
		copy: {
			assets: {
				expand: true,
				cwd: 'templates',
				src: ['**', '!*.hbs'],
				dest: 'dist/'
			},
			content: {
				expand: true,
				cwd: 'content',
				src: ['**/img/*.*', 'files/*.*'],
				dest: 'dist/',
			},
			bower: {
				files: [
					{'dist/css/syntax.css': [
						'bower_components/highlight/src/styles/solarized_dark.css'
					]}
				]
			},
		},
		clean: {
			all: ['dist/**'],
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
		aws: grunt.file.readJSON('aws-credentials.json'),
		aws_s3: {
			options: {
				accessKeyId: '<%= aws.AWSAccessKeyId %>',
				secretAccessKey: '<%= aws.AWSSecretKey %>',
				region: 'us-east-1',
				uploadConcurrency: 5,
				downloadConcurrency: 5,
				bucket: 'roycetownsend.com',
				// debug: true,
			},
			production: {
				differential: true,
				expand: true,
				cwd: 'dist/',
				src: ['**'],
			},
			production_clean: {
				differential: true,
				dest: '/',
				action: 'delete',
				cwd: 'dist/',
				src: ['**'],
			},
		}
	});

	grunt.loadNpmTasks('assemble');
	grunt.loadNpmTasks('grunt-aws-s3');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['clean', 'copy', 'assemble']);
	grunt.registerTask('deploy', ['aws_s3:production', 'aws_s3:production_clean'])
};