import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {CoreModule} from './core/core.module';
import {ToastrService} from 'ngx-toastr';
import {DirectusService} from './core/services/directus.service';
import {readItems} from '@directus/sdk';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CoreModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(private toastr: ToastrService, private directus: DirectusService) {
  }

  ngOnInit(): void {
    this.directus.getRestClient().request(readItems('games', {
      filter: {
        unique_code: {
          _eq: 'connectfour'
        }
      }
    }));
    this.directus.getRestClient().request(readItems('games', {
        filter: {
          unique_code: {
            _eq: 'connectfour'
          }
        }
    }));
  }


}
