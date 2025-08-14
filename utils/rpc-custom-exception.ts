import { RpcException } from '@nestjs/microservices';

export class RpcCustomException extends RpcException {
  constructor(message: string, statusCode: number) {
    console.log(message, statusCode);
    super({ message, statusCode });
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, RpcCustomException.prototype);
  }
}
