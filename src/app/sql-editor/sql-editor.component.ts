import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SnowflakeService } from '../services/snowflake.service';
import { SqlFormatterService } from '../services/sql-formatter.service';
import { MonacoEditorComponent } from '../monaco-editor/monaco-editor.component';
import { NaturalLanguageService } from '../services/natural-language.service';
import { Table, Column } from '../models/table-column.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sql-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorComponent],
  templateUrl: './sql-editor.component.html',
  styleUrls: ['./sql-editor.component.css']
})
export class SqlEditorComponent implements OnInit {
  @ViewChild('editor') editor!: MonacoEditorComponent;
  code: string = 'SELECT * FROM test';
  queryResults: any;
  naturalLanguageQuery: string = '';
  generatedSql$: Observable<string> = of('No SQL generated yet');


  constructor(
    private snowflakeService: SnowflakeService,
    private sqlFormatterService: SqlFormatterService,
    private naturalLanguageService: NaturalLanguageService
  ) {}

  ngOnInit() {
    console.log('SqlEditorComponent initialized');
    this.snowflakeService.connect().subscribe(
      () => {
        console.log('Connected to Snowflake');
      },
      error => console.error('Failed to connect to Snowflake:', error)
    );
    // this.loadTableColumns().subscribe(
    //   (tables: Table[]) => {
    //     this.tableColumns = tables;
    //     console.log('Loaded table columns:', this.tableColumns);
    //   },
    //   error => console.error('Error fetching metadata:', error)
    // );
  }

  private loadTableColumns(): Observable<Table[]> {
    return this.snowflakeService.fetchMetadata().pipe(
      map((metadata: any[]) => {
        // Use reduce to group and structure data by TABLE_NAME
        const groupedData = metadata.reduce((acc, item) => {
          // Check if the table entry already exists
          if (!acc[item.TABLE_NAME]) {
            acc[item.TABLE_NAME] = {
              name: item.TABLE_NAME,
              columns: []
            };
          }

          // Create a Column object
          const column: Column = {
            name: item.COLUMN_NAME,
            type: item.DATA_TYPE,
            is_nullable: item.IS_NULLABLE
          };

          // Push the newly formatted column into the corresponding table's columns array
          acc[item.TABLE_NAME].columns.push(column);

          return acc;
        }, {} as { [key: string]: Table });

        // Convert the grouped object back into an array of Table objects
        return Object.values(groupedData);
      })
    );
  }

  // convertToSql() {
  //   this.naturalLanguageService.convertToSql(this.naturalLanguageQuery).subscribe(
  //     (sql) => {
  //       this.generatedSql = sql;
  //     },
  //     (error) => console.error('Error converting natural language to SQL:', error)
  //   );
  // }
  convertToSql() {
    this.generatedSql$ = this.naturalLanguageService.convertToSql(this.naturalLanguageQuery);
  }

  // Add this method
  onCodeChange(newCode: string) {
    this.code = newCode;
  }

  formatSql() {
    console.log('Formatting SQL');
    const formattedCode = this.sqlFormatterService.formatSql(this.editor.getCode());
    this.editor.updateCode(formattedCode);
  }

  executeQuery() {
    const query = this.editor.getCode();
    this.snowflakeService.executeQuery(query).subscribe(
      (results) => {
        this.queryResults = results;
        console.log('Query executed successfully:', results);
      },
      (error) => {
        console.error('Error executing query:', error);
      }
    );
  }

  getHeaders(): string[] {
    if (this.queryResults && this.queryResults.sampleResults.length > 0) {
      return Object.keys(this.queryResults.sampleResults[0]);
    }
    return [];
  }
}
