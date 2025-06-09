const typescript = require('@rollup/plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');
const dts = require('rollup-plugin-dts').default; 
const postcss = require('rollup-plugin-postcss');

const packageJson = require('./package.json');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: !isProduction,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: !isProduction,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/example/**', '**/*.test.ts', '**/*.spec.ts'],
      }),
      postcss({
        config: {
          path: './postcss.config.js',
        },
        extensions: ['.css'],
        minimize: isProduction,
        inject: {
          insertAt: 'top',
        },
      }),
      isProduction && terser(),
    ].filter(Boolean),
    external: ['react', 'react-dom'],
  },
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: packageJson.types, format: 'esm' }],
    plugins: [
      dts() 
    ],
    external: [/\.css$/],
  },
];