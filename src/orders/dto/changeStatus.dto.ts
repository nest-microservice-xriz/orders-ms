import { OrderStatus } from "@prisma/client";
import { IsEnum, IsUUID } from "class-validator";
import { OrderStatusList } from "../enum/order.enum";

export class ChangeStatusDto{
    
    @IsUUID()
    id: string;

    @IsEnum(OrderStatusList,{message:`Valid status are ${OrderStatusList}`})
    status: OrderStatus
}