"use strict";

function parse(ejs, tpl, mode) {
	var tpl = tpl,
	    opener = ejs.options.opener || '<?',
	    closer = ejs.options.closer || '?>',
	    opener_len = opener.length,
	    closer_len = closer.length,
	    global_id = ejs.options.global_id || 'global';

	var js = mode == 'js';

	for (var pos = 0, js_pos = pos, len = tpl.length; pos < len;) {
		if (!js) {
			var js_pos = tpl.indexOf(opener, pos);
			if (js_pos != pos)
				ejs.push_string(tpl.slice(pos, (js_pos >= 0) ? js_pos : len));

			if (js_pos < 0) {
				pos = len;
				continue;
			}
			js_pos += opener_len;
		}

		js = 0;
		var js_end = tpl.indexOf(closer, js_pos);
		if (js_end < 0)
			js_end = len;
		switch (tpl.charAt(js_pos)) {
		case '=':
			ejs.push_expr(tpl.slice(js_pos + 1, js_end), "+''");
			break;
		case '.':
			ejs.push_expr(global_id, '.', tpl.slice(js_pos + 1, js_end), "+''");
			break;
		default:
			ejs.push_code(tpl.slice(js_pos, js_end).trim(), '\n');
		}
		pos = js_end + closer_len;
	}
}

/*
	options = {
		opener:  '<?',
		closer: '?>',
		post_process:  function (text) { return text.replace(/\n/g, '\n\r'); },
		global_id: 'global'
	}
*/

function Ejs(options) {
	this.options = options || {};
	this.code = [];
	this.text_mode = false;
	this.post_process = this.options.post_process || function (s) { return s; };
	this.is_closed = 0;
}

Ejs.prototype = {
	push_expr: function () {
		this.code.push(this.text_mode ? ", " : "$.push(");
		this.code.push.apply(this.code, arguments);
		this.text_mode = true;
		return this;
	},

	push_string: function (str) {
		this.code.push(
			!this.text_mode ? "$.push('" : ", '",
			this.post_process(str).replace(/[\\'\n]/g, /*'*/function (match) {
				return match === '\n' ? "\\n\\\n" : '\\'+match;
			}),
			"'");
		this.text_mode = true;
		return this;
	},

	push_code: function () {
		if (this.text_mode)
			this.code.push(");\n");
		this.text_mode = false;
		if (arguments.length)
			this.code.push.apply(this.code, arguments);
		return this;
	},

	push_ejs: function (tpl) {
		parse(this, tpl, 'ejs');
		return this;
	},

	push_js: function (tpl) {
		parse(this, tpl, 'js');
		return this;
	},

	listing: function () {
		return this.code.join('');
	},

	end: function () {
		if (this.is_closed)
			throw Error('closed already');
		this.code.unshift("var $=[];\n");
		this.push_code("return $.join('');\n");
		this.is_closed = 1;
		return this;
	},

	compile: function (args) {
		if (!this.is_closed)
			throw Error('not closed yet');
		return new Function(args, this.listing());
	},

	is_ejs: function (text) {
		return text.indexOf(this.options.begin || '<?') >= 0;
	}
};

module.exports = Ejs;
