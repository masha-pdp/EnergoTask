import { Component, signal } from '@angular/core';
import { UserLogViewComponent } from './user-log-view/user-log-view.component';

@Component({
  selector: 'app-root',
  imports: [UserLogViewComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}