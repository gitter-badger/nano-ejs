# nano-ejs

A very small, simple and fast EJS compiler.


[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

## Usage

```js
> var Ejs = require('nano-ejs');
> console.log(Ejs.compile('test <?=one?>', 'one')('ola'));
test ola
> _
```

## API

### Ejs.compile(text[, args[, options]])

* text `String` EJS text
* args `String` compiled function arguments list (for ```new Function (args, body)```)
* options `Object`
 * open_str `String` open embedded JS code symbols sequence (the default value is '<?')
 * close_str `String` clode embedded JS code symbols sequence (the default value is '?>')
 * global_id `String` identifier of global object (like `global` or `window`) (the default value is 'global')

### class: Ejs

#### new Ejs(options)

* options `Object`
 * open_str `String` open embedded JS code symbols sequence (the default value is '<?')
 * close_str `String` clode embedded JS code symbols sequence (the default value is '?>')
 * global_id `String` identifier of global object (like `global` or `window`) (the default value is 'global')

#### .is_ejs(text)

return `Boolean`

Check the text for EJS injections. Returns ```true``` for EJS texts.

#### .push_ejs(text)

* text `String` EJS text

#### .push_js(text)

* text `String` JS text

#### .compile(args)

* args `String` compiled function arguments list (for ```new Function (args, body)``)

#### .listing()

returns JavaScript code translated from EJS.

[gitter-image]: https://badges.gitter.im/Holixus/nano-ejs.png
[gitter-url]: https://gitter.im/Holixus/nano-ejs
[npm-image]: https://img.shields.io/npm/v/nano-ejs.svg?style=flat-square
[npm-url]: https://npmjs.org/package/nano-ejs
[github-tag]: http://img.shields.io/github/tag/Holixus/nano-ejs.svg?style=flat-square
[github-url]: https://github.com/Holixus/nano-ejs/tags
[travis-image]: https://travis-ci.org/Holixus/nano-ejs.svg?branch=master
[travis-url]: https://travis-ci.org/Holixus/nano-ejs
[coveralls-image]: https://img.shields.io/coveralls/Holixus/nano-ejs.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/Holixus/nano-ejs
[david-image]: http://img.shields.io/david/Holixus/nano-ejs.svg?style=flat-square
[david-url]: https://david-dm.org/Holixus/nano-ejs
[license-image]: http://img.shields.io/npm/l/nano-ejs.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/nano-ejs.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/nano-ejs
