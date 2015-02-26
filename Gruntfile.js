module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			main: {
				files: {
					'dist/sblork.min.js': ['dist/sblork.js']
				}
			}
		},
		concat: {
			options: {
				separator: '\n',
			},
			dist: {
				src: ['src/sblork/*.js'],
				dest: 'dist/sblork.js',
			},
		},
		clean: {
			dist: ['dist'],
			build: ['.tmp']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('build', [
		'clean:dist',
		'concat',
		'uglify:main',
	]);

	grunt.registerTask('default', ['build'])
};