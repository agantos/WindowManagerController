import { Component } from '@angular/core';
import { io } from 'socket.io-client';
import { ControllerSocket } from './socket';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'window-manager-controller';
}
// ng serve --host 192.168.1.10 --port 4200 --disable-host-check
