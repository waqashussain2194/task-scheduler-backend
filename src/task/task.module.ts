import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from './entities/task.entity';
import { ExecutionLog } from './entities/executionLog.entity';
import { TaskSchedulerService } from './taskScheduler.service';
import { BullModule } from '@nestjs/bull';
import { TaskProcessor } from './task.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, ExecutionLog]),
    BullModule.registerQueue({
      name: 'tasksQueue2',
    }),
  ],
  providers: [TaskService, TaskSchedulerService, TaskProcessor],
  controllers: [TaskController],
})
export class TaskModule { }
