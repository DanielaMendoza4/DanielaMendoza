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

    @Column({ default: 0 })
    likes: number;

    @Column({ default: 0 })
    comments: number;
}