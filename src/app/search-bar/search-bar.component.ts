import {Component, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
import { DeezerApiService } from 'angular-deezer-api';

const WIKI_URL = 'http://api.deezer.com/search/artist/autocomplete?';
const PARAMS = new HttpParams({
  // fromObject: {
  //   action: 'opensearch',
  //   format: 'json',
  //   contentType: 'application/json',
  //   dataType:'application/json',
  //   responseType:'application/json',
  // }
});

@Injectable()
export class WikipediaService {
  constructor(private http: HttpClient, private deezerApiService: DeezerApiService) {}

  search(term: string) {
    if (term === '') {
      return of([]);
    }

    this.deezerApiService.search(term).then(result => {
      console.log(result);
    });

    return this.http
      .get(WIKI_URL, {params: PARAMS.set('q', term)}).pipe(
        map(response => response[1])
      );
  }
}

@Component({
  selector: 'ngbd-typeahead-http',
  templateUrl: './search-bar.component.html',
  providers: [WikipediaService],
  styles: [`.form-control { width: 300px; display: inline; }`]
})
export class SearchBarComponent {
  model: any;
  searching = false;
  searchFailed = false;

  constructor(private _service: WikipediaService) {}

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this._service.search(term).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    )
}