const uglify       = require('uglify-js');
const mkdirp       = require('mkdirp');
const path         = require('path');
const fs           = require('fs');
const derequire    = require('derequire');
const bundleHeader = require('./bundle-header');
const replacer     = require('./replacer');

const pwd = process.env.PWD;

module.exports = function bundleProcessor ({
  bundleStream,
  headerFile,
  minHeaderFile,
  destDir,
  name,
  metadata,
}) {
  mkdirp(destDir);

  let streamCode = '';

  const filenames = {
    raw   : `${name}.js`,
    rawMap: `${name}.js.map`,
    min   : `${name}.min.js`,
    minMap: `${name}.min.js.map`,
  };

  bundleStream.on('data', chunk => streamCode += chunk);
  bundleStream.on('end', function () {
    let raw;

    try {
      raw = bundleHeader(getHeaderOpts(headerFile, filenames.raw, streamCode));
    }
    catch (e) {
      for (const filename in filenames) {
        write({
          destDir,
          filename: filenames[filename],
          code: streamCode,
          map: { sources: [] },
        });
      }

      return;
    }

    write(raw);

    const minifiedResult = uglify.minify(raw.code, {
      fromString: true,
      inSourceMap: raw.map,
      outSourceMap: `${filenames.min}.map`,
      sourceMapIncludeSources: true,
    });

    const headerOpts = getHeaderOpts(minHeaderFile, filenames.min, minifiedResult.code, JSON.parse(minifiedResult.map));
    const min = bundleHeader(headerOpts);

    write(min);
  });

  function getHeaderOpts (headerFilename, filename, code, map) {
    return {
      destDir,
      filename,
      code,
      map,
      headerFilename,
      replacer: input => replacer(input, { updateMetadata: metadata }),
    };
  }
};

function write ({ destDir, filename, code, map }) {
  map.sources = map.sources.map(source => path.relative(pwd, source));
  map.file = filename;

  const codeFilename = path.join(destDir, filename);
  const codeStream = fs.createWriteStream(codeFilename);

  codeStream.end(derequire(code));
  fs.createWriteStream(`${codeFilename}.map`).end(JSON.stringify(map));
}
