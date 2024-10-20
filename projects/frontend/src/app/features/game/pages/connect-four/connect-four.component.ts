import { Component } from '@angular/core';
import {NgClass, NgForOf} from '@angular/common';

@Component({
  selector: 'app-connect-four',
  standalone: true,
  imports: [
    NgClass,
    NgForOf
  ],
  templateUrl: './connect-four.component.html',
  styleUrl: './connect-four.component.scss'
})
export class ConnectFourComponent {
  board: (string | null)[] = Array(42).fill(null);

}
