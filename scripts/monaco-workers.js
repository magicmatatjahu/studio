const path = require('path');

module.exports = {
	entry: {
		'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
		'json.worker': 'monaco-editor/esm/vs/language/json/json.worker.js',
		'yaml.worker': 'monaco-yaml/yaml.worker.js',
	},
	output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, '..', 'public', 'js', 'monaco'),
	},
};