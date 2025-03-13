import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { log } from 'console';
import { firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common/dto';
import { NATS_SERVICE } from 'src/conf';
import { ChangeStatusDto, CreateOrderDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  constructor(@Inject(NATS_SERVICE) private readonly Client: ClientProxy) {
    super();
  }

  private readonly logger = new Logger('OrdersService')

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected')
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      
      const producsId:any[] = createOrderDto.items.map((item) => item.productId)
      const products: any[] = await firstValueFrom(
        this.Client.send({ cmd: 'validate_products' }, producsId )
      )

      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const product = products.find((product) => product.id === orderItem.productId);
        if (product) {
          return acc + (product.price * orderItem.quantity);
        }
        return acc;
      }, 0);

      const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
        const product = products.find((product) => product.id === orderItem.productId);
        if (product) {
          return acc + (orderItem.quantity);
        }
        return acc;
      },0)

      const orderItems = createOrderDto.items.map((order)=> {
        return {
          price:products.find((product)=> product.id == order.productId).price,
          productId:order.productId,
          quantity: order.quantity
        }
      })

      const order = await this.order.create({
        data:{
          totalAmount,
          totalItems,
          status:OrderStatus.PENDING,
          orderItem:{
            createMany:{
              data:orderItems
            }
          }
        },
        include:{
          orderItem: {
            select:{
              price: true,
              quantity: true,
              productId: true
            }
          }
        }
      })


      
      return {
        ...order,
        orderItem: order.orderItem.map((orderItem) => ({
            ...orderItem,
            name: products.find((product)=> product.id == orderItem.productId).name
          }
        ))
      }

    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message:'Check logs'
      });
    }

    // return this.order.create({
    //   data: createOrderDto
    // })
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
    const order = await this.order.findUnique({ where: { id }, include: {orderItem:{
      select:{
        price:true,
        quantity: true,
        productId: true
      }
    }}});

    const productsId = await order.orderItem.map((orderItem) => (orderItem.productId))
    const products: any[] = await firstValueFrom(
      this.Client.send({ cmd: 'validate_products' }, productsId )
    )

    if (!order) {
      throw new RpcException({
        message: `Order with id ${id} not found`,
        status: HttpStatus.NOT_FOUND
      })
    }
    
    return {
      ...order, 
      orderItem: order.orderItem.map((orderItem) => ({
        ...orderItem,
        name: products.find((product)=> product.id == orderItem.productId).name
      }))
    }
  }

  async updateOrder(changeStatusDto: ChangeStatusDto) {
    log(changeStatusDto)
    const { id, status } = changeStatusDto;

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
