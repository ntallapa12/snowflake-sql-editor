// src/app/providers/snowflake-hover-provider.ts
import { PerModelProviderBase } from './per-model-provider-base';
import { SNOWFLAKE_FUNCTIONS } from '../utils/snowflake-functions';
import * as monaco from 'monaco-editor';

export class SnowflakeHoverProvider extends PerModelProviderBase {
  public register() {
    return monaco.languages.registerHoverProvider('snowflake-sql', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) {
          return null;
        }

        const func = SNOWFLAKE_FUNCTIONS.find(f => f.name.toLowerCase() === word.word.toLowerCase());
        if (func) {
          return {
            contents: [
              { value: '**' + func.name + '**' },
              { value: func.signature },
              { value: func.description }
            ]
          };
        }

        // Add hover information for SQL keywords if needed
        // ...

        return null;
      }
    });
  }

  setModel(model: monaco.editor.ITextModel) {
    this._model = model;
  }

}
