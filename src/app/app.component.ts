import { Component, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { URLSearchParams, Jsonp } from '@angular/http';

import { Observable, of, fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, combineLatest, switchMap, mapTo, startWith } from 'rxjs/operators';

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
    this.eventStream('searchText', 'keyup').pipe(
      debounceTime(400),
      distinctUntilChanged(),
      combineLatest( this.eventStream('resultLimit', 'change').pipe( startWith( 5 ))),
      switchMap(([term, limit]) =>  {
        if ( term ) {
          this.searchRequest( term, limit )
        } else {
          return of([]);
        }
      }),
    ).subscribe( values => this.items = values );
  }

  searchRequest( term, limit ): Observable<Array<string>>{
      console.log( `Searching Wikipedia for "${term}"` );

      const search = new URLSearchParams();
      search.set('action', 'opensearch');
      search.set('search', term);
      search.set('format', 'json');
      search.set('limit', limit );
      return this.jsonp
          .get('http://en.wikipedia.org/w/api.php?callback=JSONP_CALLBACK', { search })
          .pipe( map(response => response.json()[1]));
  }

  eventStream( id, eventName ){
    const element = <HTMLInputElement>document.getElementById(id);
    return fromEvent<KeyboardEvent>( element, eventName ).pipe( map(() => element.value ));
  }

}
