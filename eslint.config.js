import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const strictTypeCheckedRules = tsPlugin.configs['strict-type-checked']?.rules ?? {};

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...strictTypeCheckedRules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
          allowNullableBoolean: false,
          allowNullableString: false,
        },
      ],
      '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      '@typescript-eslint/no-unsafe-enum-comparison': 'error',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true, ignoreVoidOperator: true },
      ],
    },
  },
  {
    ignores: [
      '.yarn/',
      'node_modules/',
      'dist/',
      'packages/**/dist/',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
];
