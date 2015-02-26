module.exports = function(grunt) {
	var basePath = 'dist/';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			main: {
				files: {
					'dist/sblork.min.js': [
						'src/sblork/Core.js',
						'src/sblork/EventManager.js',
						'src/sblork/Router.js'
					]
				}
			}
		},
		clean: {
			build: ['.tmp']
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	grunt.registerTask('build', [
		'uglify:main',
	]);
	
	grunt.registerTask('default', ['build'])
};