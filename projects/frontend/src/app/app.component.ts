import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CoreModule} from './core/core.module';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CoreModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{

  constructor(private toastr: ToastrService) {
  }

  ngOnInit(): void {

  }


}
