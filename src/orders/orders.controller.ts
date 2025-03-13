import { Controller, NotImplementedException, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderStatus } from '@prisma/client';
import { PaginationDto } from 'src/common/dto';
import { ChangeStatusDto, CreateOrderDto } from './dto';
import { OrdersService } from './orders.service';
import { log } from 'console';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern('findAllOrders')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.ordersService.findAll(paginationDto);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload('id') id: string ) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern({ cmd: 'changeOrderStatus' })
  updateOrder(
    @Payload('changeStatusDto') changeStatusDto: ChangeStatusDto,
  ) {
    log(changeStatusDto)
    return this.ordersService.updateOrder(changeStatusDto);
  }

}
