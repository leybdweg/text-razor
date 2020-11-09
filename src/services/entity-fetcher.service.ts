import {Injectable, OnModuleInit} from "@nestjs/common";
import {Cron, CronExpression} from "@nestjs/schedule";
import * as amqp from "amqplib";
import {promisify} from "util";
import {EntityService} from "./entity.service";

@Injectable()
export class EntityFetcherService implements OnModuleInit {
    private rmqConsumingQueue = 'entities'
    private rmqChannel: amqp.Channel;
    constructor(
        private readonly entityService: EntityService,
    ) {}

    async onModuleInit(): Promise<void> {
        const rmqConnection = await amqp.connect(process.env.RMQ_URL || 'amqp://user:user@localhost:5672')
        this.rmqChannel = await rmqConnection.createChannel();
        await this.rmqChannel.consume(this.rmqConsumingQueue, this.consumingCallback)
    }

    private async consumingCallback(message: amqp.ConsumeMessage) {
        const payload = JSON.parse(message.content.toString())
        // connect with text-razor
        // save to db
        await this.entityService.createEntity({
            razorData: {aa: 1},
            razorId: "",
            fileId: payload.fileId
        })
    }

}
