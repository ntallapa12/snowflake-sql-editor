// src/app/monaco-editor/snowflake-sql-language.ts
import * as monaco from 'monaco-editor';

export const SnowflakeSQL: monaco.languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.sql',
  ignoreCase: true,

  brackets: [
    { open: '[', close: ']', token: 'delimiter.square' },
    { open: '(', close: ')', token: 'delimiter.parenthesis' }
  ],

  keywords: [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'UPDATE', 'DELETE',
    'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION',
    // Add Snowflake-specific keywords here
    'WAREHOUSE', 'CLONE', 'SHARE', 'STAGE', 'PIPE', 'TASK', 'STREAM',
    'COPY', 'MERGE', 'UNDROP', 'RLIKE', 'SAMPLE', 'QUALIFY', 'PIVOT', 'UNPIVOT'
  ],

  operators: [
    '=', '>', '<', '!', '~', '?', ':',
    '==', '<=', '>=', '!=', '&&', '||', '++', '--', '+', '-', '*', '/',
    '&', '|', '^', '%', '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
    '%=', '<<=', '>>=', '>>>='
  ],

  builtinFunctions: [
    // Add Snowflake-specific functions here
    'SYSTEM$WHITELIST', 'SYSTEM$STREAM_HAS_DATA', 'SYSTEM$CANCEL_QUERY',
    'SYSTEM$EXPLAIN_PLAN_JSON', 'SYSTEM$GENERATE_SCIM_ACCESS_TOKEN'
  ],

  tokenizer: {
    root: [
      { include: '@comments' },
      { include: '@whitespace' },
      { include: '@numbers' },
      { include: '@strings' },
      { include: '@complexIdentifiers' },
      { include: '@scopes' },
      [/[;,.]/, 'delimiter'],
      [/[()]/, '@brackets'],
      [/[\w@#$]+/, {
        cases: {
          '@keywords': 'keyword',
          '@operators': 'operator',
          '@builtinFunctions': 'predefined',
          '@default': 'identifier'
        }
      }],
      [/[<>=!%&+\-*/|~^]/, 'operator'],
    ],
    whitespace: [
      [/\s+/, 'white']
    ],
    comments: [
      [/--+.*/, 'comment'],
      [/\/\*/, { token: 'comment.quote', next: '@comment' }]
    ],
    comment: [
      [/[^*/]+/, 'comment'],
      [/\*\//, { token: 'comment.quote', next: '@pop' }],
      [/./, 'comment']
    ],
    numbers: [
      [/0[xX][0-9a-fA-F]*/, 'number'],
      [/[$][+-]*\d*(\.\d*)?/, 'number'],
      [/((\d+(\.\d*)?)|(\.\d+))([eE][\-+]?\d+)?/, 'number']
    ],
    strings: [
      [/'/, { token: 'string', next: '@string' }],
      [/"/, { token: 'string.double', next: '@stringDouble' }]
    ],
    string: [
      [/[^']+/, 'string'],
      [/''/, 'string'],
      [/'/, { token: 'string', next: '@pop' }]
    ],
    stringDouble: [
      [/[^"]+/, 'string.double'],
      [/""/, 'string.double'],
      [/"/, { token: 'string.double', next: '@pop' }]
    ],
    complexIdentifiers: [
      [/\[/, { token: 'identifier.quote', next: '@bracketedIdentifier' }],
      [/"/, { token: 'identifier.quote', next: '@quotedIdentifier' }]
    ],
    bracketedIdentifier: [
      [/[^\]]+/, 'identifier'],
      [/]]/, 'identifier'],
      [/]/, { token: 'identifier.quote', next: '@pop' }]
    ],
    quotedIdentifier: [
      [/[^"]+/, 'identifier'],
      [/""/, 'identifier'],
      [/"/, { token: 'identifier.quote', next: '@pop' }]
    ],
    scopes: [
      [/BEGIN\s+(TRAN|TRANSACTION)/, { token: 'keyword.scope', next: '@scope' }],
      [/BEGIN/, { token: 'keyword.scope', next: '@scope' }],
      [/END\s+(TRAN|TRANSACTION)/, { token: 'keyword.scope' }],
      [/END/, { token: 'keyword.scope' }],
      [/COMMIT\s+(TRAN|TRANSACTION)/, { token: 'keyword.scope' }],
      [/ROLLBACK\s+(TRAN|TRANSACTION)/, { token: 'keyword.scope' }],
      [/COMMIT/, { token: 'keyword.scope' }],
      [/ROLLBACK/, { token: 'keyword.scope' }],
    ],
    scope: [
      [/BEGIN\s+(TRAN|TRANSACTION)/, { token: 'keyword.scope', next: '@scope' }],
      [/BEGIN/, { token: 'keyword.scope', next: '@scope' }],
      [/END\s+(TRAN|TRANSACTION)/, { token: 'keyword.scope', next: '@pop' }],
      [/END/, { token: 'keyword.scope', next: '@pop' }],
      [/COMMIT\s+(TRAN|TRANSACTION)/, { token: 'keyword.scope', next: '@pop' }],
      [/ROLLBACK\s+(TRAN|TRANSACTION)/, { token: 'keyword.scope', next: '@pop' }],
      [/COMMIT/, { token: 'keyword.scope', next: '@pop' }],
      [/ROLLBACK/, { token: 'keyword.scope', next: '@pop' }],
      { include: '@root' }
    ],
  },
};
