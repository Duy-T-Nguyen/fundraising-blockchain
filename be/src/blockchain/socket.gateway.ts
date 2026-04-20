import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('SocketGateway');

  afterInit(server: Server) {
    this.logger.log('Init Socket.io Gateway');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Khi User kết nối, họ sẽ join vào room theo địa chỉ ví.
   * Chúng ta không cần quản lý mảng 'onlineUsers' thủ công vì:
   * 1. Socket.io rooms tự động quản lý các kết nối đang hoạt động.
   * 2. Nếu User offline, thông báo vẫn được lưu trong MongoDB (đã triển khai trong BlockchainListenerService).
   * 3. Khi User online trở lại, họ sẽ fetch thông báo cũ từ DB qua API.
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Lấy address từ query (vd: socket.connect({ query: { address: '0x...' } }))
    const address = client.handshake.query.address as string;
    if (address) {
      const room = address.toLowerCase();
      client.join(room);
      this.logger.log(`Client ${client.id} joined room: ${room}`);
    }
  }

  /**
   * Gửi thông báo tới một địa chỉ cụ thể (Validator)
   */
  sendToUser(address: string, event: string, data: any) {
    this.server.to(address.toLowerCase()).emit(event, data);
    this.logger.log(`Emitted ${event} to user ${address.toLowerCase()}`);
  }

  /**
   * Gửi thông báo tới tất cả mọi người
   */
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`Broadcasted ${event}`);
  }
}
