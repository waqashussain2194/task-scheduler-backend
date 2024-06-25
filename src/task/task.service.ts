import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { ExecutionLog } from './entities/executionLog.entity';
import { TaskSchedulerService } from './taskScheduler.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(ExecutionLog)
    private executionLogRepository: Repository<ExecutionLog>,
    private taskSchedulerService: TaskSchedulerService,
  ) { }

  async create(task: Task): Promise<Task> {
    try {
      const newTask = await this.taskRepository.save(task);
      this.taskSchedulerService.scheduleTask(newTask);
      return newTask;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to create task: ${error.message}`);
    }
  }

  async findAll(): Promise<Task[]> {
    try {
      return await this.taskRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch tasks: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<Task> {
    try {
      const task = await this.taskRepository.findOne({ where: { id } });
      if (!task) {
        throw new NotFoundException(`Task with id ${id} not found`);
      }
      return task;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch task with id ${id}: ${error.message}`);
    }
  }

  async update(id: number, task: Task): Promise<Task> {
    try {
      await this.taskRepository.update(id, task);
      const updatedTask = await this.findOne(id);
      this.taskSchedulerService.scheduleTask(updatedTask);
      return updatedTask;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update task with id ${id}: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const task = await this.findOne(id);
      if (task) {
        await this.executionLogRepository.delete({
          taskId: id
        })
        await this.taskSchedulerService.removeTask(task);
        await this.taskRepository.delete(id);
      }
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete task with id ${id}: ${error.message}`);
    }
  }

  async findAllLogs(): Promise<ExecutionLog[]> {
    try {
      return await this.executionLogRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch execution logs: ${error.message}`);
    }
  }
}
