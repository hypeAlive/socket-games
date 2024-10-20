import {Component, Input} from '@angular/core';
import {NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'join-window',
  standalone: true,
    imports: [
        NgIf,
        ReactiveFormsModule
    ],
  templateUrl: './window.component.html',
  styles: []
})
export class WindowComponent {

  @Input() title: string = '';

}
