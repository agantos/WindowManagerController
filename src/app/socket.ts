import { io } from 'socket.io-client';

export class ControllerSocket {
  public static socket = io('http://172.31.240.1:3000');
}
