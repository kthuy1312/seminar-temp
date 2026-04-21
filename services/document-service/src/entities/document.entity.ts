import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FileType {
  PDF = 'pdf',
  DOCX = 'docx',
}

export enum DocumentStatus {
  UPLOADING = 'uploading',
  READY = 'ready',
  ERROR = 'error',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, name: 'original_name' })
  originalName: string;

  @Column({ type: 'varchar', length: 255, name: 'file_name' })
  fileName: string;

  @Column({ type: 'text', name: 'file_path' })
  filePath: string;

  @Column({
    type: 'enum',
    enum: FileType,
    name: 'file_type',
  })
  fileType: FileType;

  @Column({ type: 'bigint', name: 'file_size' })
  fileSize: number;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.READY,
  })
  status: DocumentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
