module.exports = {
  '*.{js,jsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write',
    'git add'
  ],
  '*.{json,md,css}': [
    'prettier --write',
    'git add'
  ],
  '*.{js,jsx}': [
    () => 'npm run test -- --watchAll=false --passWithNoTests'
  ]
};