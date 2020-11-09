import { Module } from '@nestjs/common';
import {FileManagerJob} from "./services/file-manager.job";
import {EntityService} from "./services/entity.service";
import {ScheduleModule} from "@nestjs/schedule";
import {EntityFetcherService} from "./services/entity-fetcher.service";

@Module({
  imports: [
      ScheduleModule.forRoot()
  ],
  controllers: [],
  providers: [
      FileManagerJob,
      EntityService,
      EntityFetcherService
  ],
})
export class AppModule {}
