import { Controller, Get, Post, Body, Param, Put, Delete, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { ExecutionLog } from './entities/executionLog.entity';

@Controller('tasks')
export class TaskController {
  private readonly logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskService) { }

  @Post()
  async create(@Body() task: Task): Promise<Task> {
    this.logger.log(`Creating task: ${JSON.stringify(task)}`);
    try {
      if (task.type === 'recurring') {
        const executionTime = new Date();
        executionTime.setSeconds(executionTime.getSeconds() + 12);
        task.executionTime = executionTime;
      }
      return await this.taskService.create(task);
    } catch (error) {
      this.logger.error(`Failed to create task: ${error.message}`);
      throw new HttpException('Failed to create task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(): Promise<Task[]> {
    this.logger.log('Fetching all tasks');
    try {
      return await this.taskService.findAll();
    } catch (error) {
      this.logger.error(`Failed to fetch tasks: ${error.message}`);
      throw new HttpException('Failed to fetch tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/logs')
  async findAllLogs(): Promise<ExecutionLog[]> {
    this.logger.log('Fetching all execution logs');
    try {
      return await this.taskService.findAllLogs();
    } catch (error) {
      this.logger.error(`Failed to fetch execution logs: ${error.message}`);
      throw new HttpException('Failed to fetch execution logs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Task> {
    this.logger.log(`Fetching task with id: ${id}`);
    try {
      const task = await this.taskService.findOne(+id);
      if (!task) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }
      return task;
    } catch (error) {
      this.logger.error(`Failed to fetch task with id ${id}: ${error.message}`);
      throw error instanceof HttpException ? error : new HttpException('Failed to fetch task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() task: Task): Promise<Task> {
    this.logger.log(`Updating task with id: ${id}`);
    try {
      if (task.type === 'recurring') {
        const executionTime = new Date();
        executionTime.setSeconds(executionTime.getSeconds() + 12);
        task.executionTime = executionTime;
      }
      const updatedTask = await this.taskService.update(+id, task);
      if (!updatedTask) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }
      return updatedTask;
    } catch (error) {
      this.logger.error(`Failed to update task with id ${id}: ${error.message}`);
      throw error instanceof HttpException ? error : new HttpException('Failed to update task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting task with id: ${id}`);
    try {
      await this.taskService.remove(+id);
    } catch (error) {
      this.logger.error(`Failed to delete task with id ${id}: ${error.message}`);
      throw error instanceof HttpException ? error : new HttpException('Failed to delete task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
