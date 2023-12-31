import { Global, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';

@Global()
@Module({
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway],
})
export class SocketModule {}
