import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { ExecutionLog } from './entities/executionLog.entity';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class TaskSchedulerService implements OnModuleInit {
  constructor(
    @InjectRepository(ExecutionLog)
    private executionLogRepository: Repository<ExecutionLog>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectQueue('tasksQueue2') private tasksQueue2: Queue,
  ) { }

  async onModuleInit() {
    await this.scheduleTasks();
  }

  async scheduleTasks() {
    const tasks = await this.taskRepository.find();
    tasks.forEach(task => {
      this.scheduleTask(task);
    });
  }

  async scheduleTask(task: Task) {
    if (task.type === 'one-time') {
      const executionTime = new Date(task.executionTime);
      const delay = executionTime.getTime() - Date.now();
      if (delay > 0) {
        const job = await this.tasksQueue2.add('executeTask', task, { delay });
        task.jobId = job?.id.toString();
        await this.taskRepository.save(task);
      }
    } else if (task.type === 'recurring') {
      const initialDelay = 10000; // 10 seconds in milliseconds

      const job = await this.tasksQueue2.add(
        'executeTask',
        task,
        {
          delay: initialDelay,
          repeat: { every: 10000 } // Repeat every 10 seconds
        }
      );

      task.jobId = job?.id.toString();
      await this.taskRepository.save(task);
    }
  }


  async executeTask(task: Task) {
    const actualExecutionTime = new Date();
    await this.logExecution(
      task.id,
      task.executionTime,
      actualExecutionTime,
      'executed',
    );
    task.status = 'executed';
    await this.taskRepository.save(task);
  }

  async removeTask(task: Task) {
    if (task.jobId) {
      const job = await this.tasksQueue2.getJob(task.jobId);
      if (job) {
        await job.remove();
      }
    }
  }

  async logExecution(taskId: number, executionTime: Date, actualExecutionTime: Date, status: string): Promise<ExecutionLog> {
    try {
      const log = new ExecutionLog();
      log.taskId = taskId;
      log.executionTime = executionTime;
      log.actualExecutionTime = actualExecutionTime;
      log.status = status;
      return await this.executionLogRepository.save(log);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to log execution for task ${taskId}: ${error.message}`);
    }
  }
}
