var Ejs = require('../index.js'),
    assert = require('core-assert');

var timer = function (ms, v) {
	return new Promise(function (resolve, reject) {
		var to = setTimeout(function () {
				resolve(v);
			}, ms);
		return { cancel: function () {
			clearTimeout(to);
		}};
	});
};

function ts(a, radix, deep) {
	switch (typeof a) {
	case 'object':
		if (a instanceof Array) {
			var o = [];
			for (var i = 0, n = a.length; i < n; ++i)
				o[i] = ts(a[i], radix, 1);
			return deep ? '['+o.join(',')+']' : o.join(',');
		} else {
			if (a === null)
				return 'null';
			var o = [];
			for (var id in a)
				o.push(id+':'+ts(a[id], radix, 1));
			return '{' + o.join(',') + '}';
		}
		break;
	case 'string':
		var qc = 0, dqc = 0;
		for (var i = 0, n = a.length; i < n; ++i)
			switch (a.charAt(i)) {
			case "'": ++qc; break;
			case '"': ++dqc; break;
			}
		if (qc <= dqc) {
			return '"' + a.replace(/["\t\n\r]/g, function (m) { //"
				switch (m) {
				case '"':	return '\\"';
				case '\t':  return '\\t';
				case '\n':  return '\\n';
				case '\r':  return '\\r';
				default:    return m;
				}
			}) + '"';
		} else {
			return "'" + a.replace(/['\t\n\r]/g, function (m) { //'
				switch (m) {
				case "'":	return "\\'";
				case '\t':  return '\\t';
				case '\n':  return '\\n';
				case '\r':  return '\\r';
				default:    return m;
				}
			}) + "'";
		}
	case 'number':
		switch (radix) {
		case 2:
		case undefined:
		default:
			return '0b'+a.toString(2);
		case 10:
			return a.toString(10);
		case 16:
			return '0x'+a.toString(16);
		case 8:
			return '0o'+a.toString(8);
		}
	case 'undefined':
		return 'undefined';
	case 'function':
	case 'boolean':
		return a.toString();
	}
}

function massive(name, fn, pairs, sradix, dradix) {
	suite(name, function () {
		for (var i = 0, n = pairs.length; i < n; i += 2)
			(function (args, ret) {
				test(fn.name+'('+ts(args, sradix)+') -> '+ts(ret, dradix)+'', function (done) {
					assert.strictEqual(args instanceof Array ? fn.apply(null, args) : fn.call(null, args), ret);
					done();
				});
			})(pairs[i], pairs[i+1]);
	});
}

function massive_reversed(name, fn, pairs, sradix, dradix) {
	suite(name, function () {
		for (var i = 0, n = pairs.length; i < n; i += 2)
			(function (args, ret) {
				test(fn.name+'('+ts(args, sradix)+') -> '+ts(ret, dradix)+'', function (done) {
					assert.strictEqual(args instanceof Array ? fn.apply(null, args) : fn.call(null, args), ret);
					done();
				});
			})(pairs[i+1], pairs[i]);
	});
}

suite('new Ejs() // default options', function () {

	massive('parsing with <?=expression?>', function (text) {
		return new Ejs().push_ejs(text).push_code().listing();
	}, [
		"wrwrwerwer", "$.push('wrwrwerwer');\n",
		"wrwr<?='5'?>werwer", "$.push('wrwr', '5'+'', 'werwer');\n",
		"wrwr<?=888?>werwer", "$.push('wrwr', 888+'', 'werwer');\n",
		"<?=888?>werwer", "$.push(888+'', 'werwer');\n",
		"qweqwe<?=888?>", "$.push('qweqwe', 888+'');\n",
		"<?=888?>", "$.push(888+'');\n"
	]);

	massive('parsing with <?.id()?>', function (text) {
		return new Ejs().push_ejs(text).push_code().listing();
	}, [
		"wrwrwerwer", "$.push('wrwrwerwer');\n",
		"wrwr<?.fn()?>werwer", "$.push('wrwr', global.fn()+'', 'werwer');\n",
		"wrwr<?.ooo('4')?>werwer", "$.push('wrwr', global.ooo('4')+'', 'werwer');\n",
		"<?.ogo(4)?>werwer", "$.push(global.ogo(4)+'', 'werwer');\n",
		"qweqwe<?.job(true)?>", "$.push('qweqwe', global.job(true)+'');\n",
		"<?.just(1.1)?>", "$.push(global.just(1.1)+'');\n"
	]);

	massive('parsing with <? JS-CODE ?>', function (text) {
		return new Ejs().push_ejs(text).push_code().listing();
	}, [
		"wrwrwerwer", "$.push('wrwrwerwer');\n",
		"wr'wr\n<? /* JS */ ?>werwer", "$.push('wr\\'wr\\n\\\n');\n/* JS */\n$.push('werwer');\n",
		"wrwr<? while (1) {\n\t?>werwer<?\n}?>", "$.push('wrwr');\nwhile (1) {\n$.push('werwer');\n}\n",
		"<? if (o) ?>werwer", "if (o)\n$.push('werwer');\n",
		"qweqwe<? var q = 1; ?>", "$.push('qweqwe');\nvar q = 1;\n",
		"<? /* only JS code */ \"use strict\"; ?>", "/* only JS code */ \"use strict\";\n"
	]);

	massive('parsing JS ?>test<?', function (text) {
		return new Ejs().push_js(text).push_code().listing();
	}, [
		"wrwrwerwer", "wrwrwerwer\n",
		"wrwrwerwer ?>just test<? js-code", "wrwrwerwer\n$.push('just test');\njs-code\n",
		"wrwrwerwer ?>just test", "wrwrwerwer\n$.push('just test');\n"
	]);

	massive('is_ejs() method', function (text) {
		return new Ejs().is_ejs(text);
	}, [
		"rwerwerwer", false,
		"<?ere", true,
		"ererer<?werwer", true,
		"werwerw<?erwerwe?>werwerwer", true,
		"werwer?>werwerwer", false,
		"<?erwerwer?>", true
	]);

	massive('compile and execute with <?=expression?>', function (text) {
		return new Ejs().push_ejs(text).end().compile()("-one-", "-two-");
	}, [
		"wrwrwerwer", "wrwrwerwer",
		"wrwr<?='5'?>werwer", "wrwr5werwer",
		"wrwr<?=888?>werwer", "wrwr888werwer",
		"<?=888?>werwer", "888werwer",
		"qweqwe<?=888?>", "qweqwe888",
		"<?=888?>", "888"
	]);

	massive('compile and execute with <?.id()?>', function (text) {
		return new Ejs().push_ejs(text).end().compile()("-one-", "-two-");
	}, [
		"wrwr<?.parseInt('45')?>werwer", "wrwr45werwer",
		"<?.parseInt('4')?>werwer", "4werwer",
		"qweqwe<?.parseFloat('5.5')?>", "qweqwe5.5",
		"<?.parseInt('23423')?>", "23423"
	]);

	massive('compile and execute with <? JS-CODE ?>', function (text) {
		return new Ejs().push_ejs(text).end().compile()("-one-", "-two-");
	}, [
		"wr'wr\n<? /* JS */ ?>werwer", "wr'wr\nwerwer",
		"wrwr-<? for (var c = 4; c; --c) {\n\t?>(<?=c?> werwer)<?\n}?>", "wrwr-(4 werwer)(3 werwer)(2 werwer)(1 werwer)"
	]);

	test('compile not closed code', function (done) {
		try {
			new Ejs().push_ejs("").compile()("-one-", "-two-");
		} catch (e) {
			return done();
		}
		return done(new Error('fail'));
	});

	test('double close', function (done) {
		try {
			new Ejs().push_ejs("").end().end().compile()("-one-", "-two-");
		} catch (e) {
			return done();
		}
		return done(new Error('fail'));
	});

/*	massive('rgb -> hsv', function () {
		return round_hsv(c.rgb2hsv.apply(c, arguments));
	}, rgb_vs_hsv_samples, 10, 10);

	massive_reversed('hsv -> rgb', function () {
		return round_rgb(c.hsv2rgb.apply(c, arguments));
	}, rgb_vs_hsv_samples, 10, 10);
*/

});
