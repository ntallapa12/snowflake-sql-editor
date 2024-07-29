// src/app/services/natural-language.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ConvertToSqlRequest {
  query: string;
}

interface ConvertToSqlResponse {
  sql: string;
}

interface ConvertToSqlRequest {
  query: string;
}
@Injectable({
  providedIn: 'root'
})
export class NaturalLanguageService {
  private apiUrl = 'http://localhost:8000/api/v1/generate_sql'; // Replace with your actual endpoint

  constructor(private http: HttpClient) {}

  convertToSql(naturalLanguageQuery: string): Observable<string> {
    const request: ConvertToSqlRequest = {
      query: naturalLanguageQuery
    };
    return this.http.post<ConvertToSqlResponse>(this.apiUrl, request).pipe(
      map(response => response.sql)
    );
  }
}
