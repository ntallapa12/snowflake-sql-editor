import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  EventEmitter,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { SnowflakeSQL } from './snowflake-sql-language';
import { SqlColumnsCompletionItemProvider } from '../providers/sql-columns-completion-item-provider';
import { SnowflakeHoverProvider } from '../providers/snowflake-hover-provider';
import { SnowflakeSignatureHelpProvider } from '../providers/snowflake-signature-help-provider';
import { SnowflakeService } from '../services/snowflake.service';


// Define an interface for the metadata item
interface ColumnData {
  TABLE_NAME: string;
  COLUMN_NAME: string;
}


interface TableColumns {
  tableName: string;
  columns: string[];
}

@Component({
  selector: 'app-monaco-editor',
  imports: [CommonModule, FormsModule],
  standalone: true,
  template: '<div #editorContainer style="width:100%;height:100%;"></div>',
  styles: [':host { display: block; height: 100%; }']
})
export class MonacoEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  @Input() code: string = '';
  @Output() codeChange = new EventEmitter<string>();

  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private disposables: monaco.IDisposable[] = [];
  private sqlColumnsCompletionProvider: SqlColumnsCompletionItemProvider;
  private hoverProvider:SnowflakeHoverProvider;
  private signatureHelpProvider:SnowflakeSignatureHelpProvider;

  constructor(private snowflakeService: SnowflakeService) {
    this.sqlColumnsCompletionProvider = new SqlColumnsCompletionItemProvider(this.snowflakeService);
    this.hoverProvider = new SnowflakeHoverProvider();
    this.signatureHelpProvider = new SnowflakeSignatureHelpProvider
  }

  ngOnInit() {
    console.log('MonacoEditorComponent initialized');
    monaco.languages.register({ id: 'snowflake-sql' });
    monaco.languages.setMonarchTokensProvider('snowflake-sql', SnowflakeSQL);
  }

  ngAfterViewInit() {
    this.initMonaco();
    this.initProviders();
  }

  private initMonaco() {
    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: this.code,
      language: 'snowflake-sql',
      theme: 'vs-dark',
      automaticLayout: true
    });


    if (this.editor) {
      this.sqlColumnsCompletionProvider.setModel(this.editor.getModel()!);
      this.hoverProvider.setModel(this.editor.getModel()!);
      this.signatureHelpProvider.setModel(this.editor.getModel()!);
    }
  }

  private initProviders() {
    this.snowflakeService.fetchMetadata().subscribe((metadata: ColumnData[]) => {
      console.log('Fetched metadata:', metadata);
      const tableColumnsMap = new Map<string, string[]>();

      metadata.forEach((item: ColumnData) => {
        if (!tableColumnsMap.has(item.TABLE_NAME)) {
          tableColumnsMap.set(item.TABLE_NAME, []);
        }
        tableColumnsMap.get(item.TABLE_NAME)!.push(item.COLUMN_NAME);
      });

      this.sqlColumnsCompletionProvider.setTableColumns(tableColumnsMap);
      this.disposables.push(this.sqlColumnsCompletionProvider.register());
      this.disposables.push(this.hoverProvider.register());
      this.disposables.push(this.signatureHelpProvider.register());

      // Register other providers if needed
      // this.disposables.push(hoverProvider.register());
      // this.disposables.push(signatureHelpProvider.register());
    });
  }

  updateCode(newCode: string) {
    if (this.editor) {
      this.editor.setValue(newCode);
    } else {
      console.error('Editor not initialized');
    }
  }
  getCode(): string {
    return this.editor ? this.editor.getValue() : '';
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.dispose();
    }
    this.disposables.forEach(d => d.dispose());
  }
}
