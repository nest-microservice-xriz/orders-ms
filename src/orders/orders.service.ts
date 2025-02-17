import { OrderStatusList } from './enum/order.enum';
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { ChangeStatusDto, CreateOrderDto, UpdateOrderDto } from './dto';
import { PaginationDto } from 'src/common/dto';
import { RpcException } from '@nestjs/microservices';
import { log } from 'console';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('OrdersService')

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected')
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({
      data: createOrderDto
    })
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto

    const totalPages = await this.order.count();

    return {
      data: await this.order.findMany({
        skip: (page - 1) * limit,
        take: +limit
      }),
      meta: {
        page,
        total: totalPages
      }
    }
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({ where: { id } });

    if (!order) {
      throw new RpcException({
        message: `Order with id ${id} not found`,
        status: HttpStatus.NOT_FOUND
      })
    }

    return await this.order.findUnique({ where: { id } })
  }

  async updateOrder(changeStatusDto: ChangeStatusDto) {
    log(changeStatusDto)
    const { id, status} = changeStatusDto;
    
    const order = await this.order.update({ data: { status }, where: { id } });

    if (!order) {
      throw new RpcException({
        message: `Order with id ${id} not found`,
        status: HttpStatus.NOT_FOUND
      })
    }

    return await this.order.findUnique({ where: { id } })
  }

}
