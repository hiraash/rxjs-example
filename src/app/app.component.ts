import { Component, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { URLSearchParams, Jsonp } from '@angular/http';

import { Observable, of, fromEvent } from 'rxjs';
import {tap, map, debounceTime, distinctUntilChanged, combineLatest, switchMap, mapTo, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  items: Array<string>;

  constructor( private jsonp: Jsonp) {}

  ngAfterViewInit() {
    this.setupSearch();
  }

  setupSearch() {
    this.searchTextStream().pipe(
      tap(value => console.log(value)),
      debounceTime(400),
      distinctUntilChanged(),
      combineLatest( this.searchLimitStream().pipe() ),
      switchMap(([term, limit]) =>  this.searchRequest( term, limit )),
    ).subscribe( values => this.items = values );
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

  searchTextStream(){
    const element = <HTMLInputElement>document.getElementById('searchText');
    return fromEvent<KeyboardEvent>( element, 'keypress' ).pipe( map(e => element.value + e.key ));
  }

  searchLimitStream(){
    const element = <HTMLInputElement>document.getElementById('resultLimit');
    return fromEvent( element, 'change' ).pipe( 
      map(() => element.value ),
      startWith( 5 )
    );
  }

}
