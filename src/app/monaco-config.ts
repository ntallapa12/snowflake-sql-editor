import { NgZone } from '@angular/core';
import * as monaco from 'monaco-editor';

export function initializeMonacoWorkers(ngZone: NgZone) {
  ngZone.runOutsideAngular(() => {
    const win = window as any;
    win.MonacoEnvironment = {
      getWorkerUrl: function (_moduleId: string, label: string) {
        if (label === 'json') {
          return './assets/monaco/vs/language/json/json.worker.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return './assets/monaco/vs/language/css/css.worker.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return './assets/monaco/vs/language/html/html.worker.js';
        }
        if (label === 'typescript' || label === 'javascript') {
          return './assets/monaco/vs/language/typescript/ts.worker.js';
        }
        return './assets/monaco/vs/editor/editor.worker.js';
      }
    } as monaco.Environment;
  });
}
