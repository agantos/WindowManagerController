import { io } from 'socket.io-client';

export class ControllerSocket {
  public static socket = io('http://192.168.1.10:3000');
}
