import {Injectable, OnModuleInit} from "@nestjs/common";
import {Cron, CronExpression} from "@nestjs/schedule";
import * as amqp from "amqplib";
import {promisify} from "util";
import { v4 as uuid } from 'uuid';
import {EntityService} from "./entity.service";
import * as readline from 'readline';
import * as fs from "fs";
import {Parser} from 'json2csv';

interface FileBeingHandled {
    readonly fileId: string;
    readonly linesCount: number;
    readonly failedUrls: number;
}
@Injectable()
export class FileManagerJob implements OnModuleInit {
    private readonly rmqPublishQueue = 'entities'
    private rmqChannel: amqp.Channel;
    private filesInProgress:FileBeingHandled[] = []
    private invalidUrlsCount: number = 0;
    private readonly csvParser: any;

    constructor(
        private readonly entityService: EntityService,
    ) {
        this.csvParser = new Parser()
    }

    async onModuleInit(): Promise<void> {
        const rmqConnection = await amqp.connect(process.env.RMQ_URL || 'amqp://user:user@localhost:5672')
        this.rmqChannel = await rmqConnection.createChannel();
        await this.rmqChannel.assertQueue(this.rmqPublishQueue);
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async readAndPublish(): Promise<void> {
        let linesCount = 0
        const fileId = uuid()
        // read file line by line
        const readInterface = readline.createInterface(
            fs.createReadStream('/path/to/file'),
            process.stdout
        );
        readInterface.on('line', (line) => {
            if(!this.isUrlValid(line)){
                this.invalidUrlsCount++;
                return;
            }
            const msgPayload = {
                fileId,
                url: line
            }
            // publish to msg-broker (RMQ)
            this.rmqChannel.publish('entities-exchange', this.rmqPublishQueue, Buffer.from(msgPayload.toString()))
            linesCount++;
        });

        // once this job is finished, prepare for next job
        this.filesInProgress.push({
            fileId: fileId,
            linesCount: linesCount,
            failedUrls: this.invalidUrlsCount
        })

    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async exportConclusions(): Promise<void> {
        let ix = 0;
        const indexesToBeDeleted = []
       const promises = this.filesInProgress.map(async (fileInProcess: FileBeingHandled) => {
           const entities = await this.entityService.getEntities(fileInProcess.fileId);
           if(entities.length === fileInProcess.linesCount){
               console.log(`Invalid urls: ${fileInProcess.failedUrls}` )
               // export CSV/JSON file
               if(process.env.OUTPUT_FORMAT, === 'csv'){
                   console.log(this.csvParser.parse(entities))
               } else {
                   console.log(JSON.stringify(entities))
               }
               indexesToBeDeleted.push(ix)
           }
           ix++;
       })
        await Promise.all(promises)
        indexesToBeDeleted.reverse().forEach((index) => delete this.filesInProgress[index])
    }


    private isUrlValid(line: string) {
        return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.test(line);
    }
}
