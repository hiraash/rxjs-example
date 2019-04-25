import { Component, AfterViewInit } from '@angular/core';
import { URLSearchParams, Jsonp } from '@angular/http';

import { Observable } from 'rxjs';
import { map, } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  items: Array<string>;

  constructor( private jsonp: Jsonp ) {}

  ngAfterViewInit() {
    
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
    
  }

}
