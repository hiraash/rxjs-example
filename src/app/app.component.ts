import { Component, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { URLSearchParams, Jsonp } from '@angular/http';

import { Observable, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, combineLatest, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  items: Observable<Array<string>>;
  term = new FormControl();
  limit = new FormControl();

  constructor( private jsonp: Jsonp) {
    this.setupSearch();
  }

  ngAfterViewInit() {
    this.limit.setValue( 10 );
  }

  setupSearch() {
    this.items = this.term.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      combineLatest( this.limit.valueChanges ),
      switchMap(([term, limit]) =>  this.searchRequest( term, limit )),
    )
  }

  searchRequest( term, limit ): Observable<Array<string>>{
    if ( term ) {
      console.log( `Searching Wikipedia for "${term}"` );

      const search = new URLSearchParams();
      search.set('action', 'opensearch');
      search.set('search', term);
      search.set('format', 'json');
      search.set('limit', limit );
      return this.jsonp
          .get('http://en.wikipedia.org/w/api.php?callback=JSONP_CALLBACK', { search })
          .pipe( map(response => response.json()[1]));
    } else {
      return of([]);
    }
  }

}
