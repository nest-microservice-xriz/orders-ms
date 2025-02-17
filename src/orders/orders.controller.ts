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

  @MessagePattern({ cmd: 'create_order' })
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern({ cmd: 'find_all_orders' })
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.ordersService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'find_one_order' })
  findOne(@Payload('id') id: string ) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_order_status' })
  updateOrder(
    @Payload('changeStatusDto') changeStatusDto: ChangeStatusDto,
  ) {
    log(changeStatusDto)
    return this.ordersService.updateOrder(changeStatusDto);
  }

}
