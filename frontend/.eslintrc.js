// eslint-disable-next-line no-undef
module.exports = {
	"env": {
		"browser": true,
		"es2021": true,
		"vue/setup-compiler-macros": true
	},
	"extends": [
		"eslint:recommended",
		"plugin:vue/vue3-essential",
		"plugin:@typescript-eslint/recommended"
	],
	"parser": "vue-eslint-parser",
	"parserOptions": {
		"ecmaVersion": 12,
		"parser": "@typescript-eslint/parser",
		"sourceType": "module"
	},
	"plugins": [
		"vue",
		"@typescript-eslint"
	],
	"rules": {
		"comma-dangle": [
			"warn",
			"only-multiline"
		],
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		],
		"vue/multi-word-component-names": "off"
	}
};
