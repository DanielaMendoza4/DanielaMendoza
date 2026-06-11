import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Snapshot {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    channelId: string;

    @Column()
    channelTitle: string;

    @Column()
    subscribers: number;

    @Column()
    totalViews: number;

    @Column()
    videoCount: number;

    @Column()
    snapshotDate: string;
}