import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import esbuild from 'rollup-plugin-esbuild';

export default {
	//  Our games entry point (edit as required)
	input: [
		'./src/game.ts'
	],

	//  Where the build file is to be generated.
	//  Most games being built for distribution can use iife as the module type.
	//  You can also use 'umd' if you need to ingest your game into another system.
	//  The 'intro' property can be removed if using Phaser 3.21 or above. Keep it for earlier versions.
	output: {
		file: './dist/game.js',
		name: 'MyGame',
		format: 'iife',
		sourcemap: false,
		intro: 'var global = window;'
	},

	plugins: [
		//  Toggle the booleans here to enable / disable Phaser 3 features:
		replace({
			'typeof CANVAS_RENDERER': JSON.stringify(true),
			'typeof WEBGL_RENDERER': JSON.stringify(true),
			'typeof EXPERIMENTAL': JSON.stringify(true),
			'typeof PLUGIN_CAMERA3D': JSON.stringify(false),
			'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
			'typeof FEATURE_SOUND': JSON.stringify(true)
		}),

		//  Parse our .ts source files
		resolve({
			extensions: ['.ts', '.tsx']
		}),

		//  We need to convert the Phaser 3 CJS modules into a format Rollup can use:
		commonjs({
			include: [
				'node_modules/eventemitter3/**',
				'node_modules/phaser/**'
			],
			exclude: [
				'node_modules/phaser/src/polyfills/requestAnimationFrame.js'
			],
			sourceMap: false,
			ignoreGlobal: true
		}),

		// See https://github.com/egoist/rollup-plugin-esbuild for config options
		esbuild({
			target: 'es2015',
			minify: true
		}),

		// See https://www.npmjs.com/package/rollup-plugin-copy for config options
		copy({
			targets: [
				{
					src: [
						"src/page/index.html",
						"src/page/style.css",
						"src/lib/phaser.min.js"
					],
					dest: "dist/"
				},
			]
		}),

		//  See https://www.npmjs.com/package/rollup-plugin-uglify for config options
		uglify({
			mangle: false
		})
	]
};