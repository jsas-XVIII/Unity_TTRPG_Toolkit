import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    plugins: {
      prettier,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Prettier formatting as lint errors
      'prettier/prettier': 'error',

      // Console usage
      'no-console': 'warn',

      // TypeScript strictness
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        // Variables and parameters: camelCase
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Functions: camelCase (PascalCase allowed for React components)
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        // Types, interfaces, enums, classes: PascalCase
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        // Enum members: PascalCase
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
        // Properties on objects/interfaces: camelCase or PascalCase
        // PascalCase allowed for domain-keyed maps (e.g. action type lookup tables)
        // Exception: properties with non-alphanumeric characters (e.g. HTTP headers like 'Content-Type')
        {
          selector: 'property',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
          filter: {
            regex: '[^a-zA-Z0-9_]',
            match: false,
          },
        },
      ],
    },
  },
])
