// src/app/providers/snowflake-signature-help-provider.ts
import { PerModelProviderBase } from './per-model-provider-base';
import * as monaco from 'monaco-editor';
import { SNOWFLAKE_FUNCTIONS } from '../utils/snowflake-functions';

export class SnowflakeSignatureHelpProvider extends PerModelProviderBase {
  public register() {
    return monaco.languages.registerSignatureHelpProvider('snowflake-sql', {
      signatureHelpTriggerCharacters: ['(', ','],
      provideSignatureHelp: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        const match = /(\w+)\s*\(/.exec(textUntilPosition);
        if (match) {
          const functionName = match[1];
          const func = SNOWFLAKE_FUNCTIONS.find(f => f.name.toLowerCase() === functionName.toLowerCase());
          if (func) {
            return {
              value: {
                signatures: [{
                  label: func.signature,
                  documentation: func.description,
                  parameters: func.signature
                    .substring(func.signature.indexOf('(') + 1, func.signature.lastIndexOf(')'))
                    .split(',')
                    .map(param => ({ label: param.trim() }))
                }],
                activeSignature: 0,
                activeParameter: Math.max(0, (textUntilPosition.match(/,/g) || []).length)
              },
              dispose: () => {}
            };
          }
        }

        return null;
      }
    });
  }

  setModel(model: monaco.editor.ITextModel) {
    this._model = model;
  }

}
