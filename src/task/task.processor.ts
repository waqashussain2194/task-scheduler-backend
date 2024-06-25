import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { TaskSchedulerService } from './taskScheduler.service';

@Processor('tasksQueue2')
export class TaskProcessor {
  constructor(
    private readonly taskScheduleService: TaskSchedulerService,
    private readonly taskService: TaskService
  ) { }

  @Process('executeTask')
  async handleExecuteTask(job: Job<Task>) {
    const task = job.data;
    const actualExecutionTime = new Date();
    await this.taskScheduleService.logExecution(
      task.id,
      task.executionTime,
      actualExecutionTime,
      'executed',
    );
    task.status = 'executed';
    await this.taskService.update(task.id, task);

    if (task.type === 'recurring') {
      await this.taskScheduleService.scheduleTask(task);
    }
  }
}
