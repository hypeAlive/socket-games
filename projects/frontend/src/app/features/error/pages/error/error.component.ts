import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgIcon, provideIcons} from "@ng-icons/core";
import {hugePlugSocket, hugeSettingError03} from "@ng-icons/huge-icons";
import {NgClass, NgIf} from "@angular/common";
import {ErrorStatusCode} from "../../models/error-state";
import {ErrorApiResponse} from "../../models/error.interface";

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [
    NgIcon,
    NgClass,
    NgIf
  ],
  viewProviders: [provideIcons({
    hugePlugSocket,
    hugeSettingError03
  })],
  templateUrl: './error.component.html',
  styles: []
})
export default class ErrorComponent {

  protected hasCountDown: boolean = false;
  private targetTimestamp: number = Date.now() + 6000000;
  protected countdown: string = '00:00';
  private intervalId: any;
  private error: ErrorApiResponse | undefined;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.data.subscribe(data => {
      this.error = data['errorData'];

      this.startCountdown();
    });
  }

  protected get statusCode(): number | undefined {
    return this.error ? this.error.code : undefined;
  }

  protected get message(): string {
    return this.error ? this.error.translations[0].message : '';
  }

  protected get description(): string {
    return this.error ? this.error.translations[0].description : '';
  }

  protected get linkButton(): string | undefined {
    if(!this.error || !this.error.show_link_button) return undefined;
    return this.error.translations[0].link_button;
  }

  protected get icon(): string | undefined {
    return this.error ? this.error.error_icon : undefined;
  }

  protected getCode(): string {
    return this.statusCode ? this.statusCode.toString() : '';
  }

  protected redirect(): void {
    if (!this.error || !this.linkButton || !this.error.link) return;
    this.router.navigate([this.error.link], { replaceUrl: true }).then(r => {});
  }

  protected get scheduledUntil(): string | undefined {
    return this.error ? this.error.scheduled_until : undefined;
  }

  private startCountdown(): void {
    if(this.statusCode !== ErrorStatusCode.ServiceUnavailable || !this.scheduledUntil) return;
    const timestamp = new Date(this.scheduledUntil).getTime() + 10;
    this.hasCountDown = true;
    this.updateCountdown(timestamp);
    this.intervalId = setInterval(() => {
      this.updateCountdown(timestamp);
    }, 1000);
  }

  private updateCountdown(timestamp: number): void {
    const now = Date.now();
    const distance = timestamp - now;

    if (distance < 0) {
      this.countdown = '00:00';
      clearInterval(this.intervalId);
      this.router.navigate(['/']).then(r => {});
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    let countdown = '';
    if (days > 0) countdown += `${this.pad(days)}:`;
    if (hours > 0 || days > 0) countdown += `${this.pad(hours)}:`;
    countdown += `${this.pad(minutes)}:${this.pad(seconds)}`;

    this.countdown = countdown;
  }

  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

}
