import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class ExecutionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taskId: number;

  @Column()
  executionTime: Date;

  @Column()
  actualExecutionTime: Date;

  @Column()
  status: string;

  @ManyToOne(() => Task)
  task: Task;
}
