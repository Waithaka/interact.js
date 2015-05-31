var dest = "./build";
var src = './src';

module.exports = {
  browserSync: {
    server: {
      // Serve up our build folder
      baseDir: dest
    }
  },
  sass: {
    src: src + "/sass/**/*.{sass,scss}",
    dest: dest,
    settings: {
      indentedSyntax: true, // Enable .sass syntax!
      imagePath: 'images' // Used by the image-url helper
    }
  },
  images: {
    src: src + "/images/**",
    dest: dest + "/images"
  },
  markup: {
    src: src + "/htdocs/**",
    dest: dest
  },
  browserify: {
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [
        {
          entries: src + '/interact.js',
          dest: dest,
          outputName: 'interact.js',
          // Additional file extentions to make optional
          extensions: [],
          // list of modules to make require-able externally
          require: ['interact']
        }
    ]
  },
  jshint: {
      src: src + "/**/*.js",
      settings: '.jshintrc'
  },
  production: {
    cssSrc: dest + '/*.css',
    jsSrc: dest + '/*.js',
    dest: dest
  }
};
