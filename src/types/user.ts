import { SocketStream } from '@fastify/websocket';

export interface User {
  id: string;
  connection?: SocketStream;
}
