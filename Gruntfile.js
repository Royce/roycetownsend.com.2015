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
			},
			content: {
				expand: true,
				cwd: 'content',
				src: ['img/*.*', 'files/*.*'],
				dest: 'dist/',
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
				differential: true,
			},
			production: {
				expand: true,
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
	grunt.registerTask('deploy', ['aws_s3:production'])
};