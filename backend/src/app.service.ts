import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Snapshot } from './snapshots/snapshot.entity';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Snapshot)
    private readonly snapshotRepository: Repository<Snapshot>,
  ) { }

  // =====================================
  // 🔥 GENERAR SNAPSHOT
  // =====================================
  async generateSnapshot(channelId: string) {
    try {
      const apiKey =
        this.configService.get<string>('YOUTUBE_API_KEY');

      if (!apiKey) {
        throw new Error('YOUTUBE_API_KEY no configurada');
      }

      const uploadsPlaylistId =
        `UU${channelId.substring(2)}`;

      // =====================================
      // 1. VIDEOS DEL CANAL
      // =====================================

      let videoIds: string[] = [];
      let videos: any[] = [];

      try {
        const playlistUrl =
          `https://www.googleapis.com/youtube/v3/playlistItems` +
          `?part=snippet` +
          `&playlistId=${uploadsPlaylistId}` +
          `&maxResults=10` +
          `&key=${apiKey}`;

        const playlistResponse =
          await axios.get(playlistUrl);

        videoIds =
          playlistResponse.data.items?.map(
            (item: any) =>
              item.snippet?.resourceId?.videoId,
          ).filter(Boolean) || [];
      } catch (error) {
        console.log(
          'Canal sin videos o playlist no disponible',
        );
      }

      // =====================================
      // 2. ESTADÍSTICAS VIDEOS
      // =====================================

      if (videoIds.length > 0) {
        const videosUrl =
          `https://www.googleapis.com/youtube/v3/videos` +
          `?part=statistics,snippet` +
          `&id=${videoIds.join(',')}` +
          `&key=${apiKey}`;

        const videosResponse =
          await axios.get(videosUrl);

        videos =
          videosResponse.data.items?.map(
            (video: any) => ({
              videoId: video.id,
              title: video.snippet.title,
              views: Number(
                video.statistics?.viewCount ?? 0,
              ),
              likes: Number(
                video.statistics?.likeCount ?? 0,
              ),
              comments: Number(
                video.statistics?.commentCount ?? 0,
              ),

              publishedAt:
                video.snippet.publishedAt,
            }),
          ) || [];
      }

      // =====================================
      // 3. DATOS DEL CANAL
      // =====================================

      const channelUrl =
        `https://www.googleapis.com/youtube/v3/channels` +
        `?part=snippet,statistics` +
        `&id=${channelId}` +
        `&key=${apiKey}`;

      const channelResponse =
        await axios.get(channelUrl);

      const channel =
        channelResponse.data.items?.[0];

      if (!channel) {
        throw new Error(
          'Canal no encontrado en YouTube',
        );
      }

      const today =
        new Date().toISOString().split('T')[0];

      // =====================================
      // 4. SNAPSHOT
      // =====================================
      const totalLikes = videos.reduce(
        (sum, video) => sum + video.likes,
        0,
      );

      const totalComments = videos.reduce(
        (sum, video) => sum + video.comments,
        0,
      );

      console.log('TOTAL LIKES:', totalLikes);
      console.log('TOTAL COMMENTS:', totalComments);
      console.log('VIDEOS:', videos.length);


      const channelSnapshot = {


        channelId,

        channelTitle:
          channel.snippet.title,

        subscribers: Number(
          channel.statistics?.subscriberCount ?? 0,
        ),

        totalViews: Number(
          channel.statistics?.viewCount ?? 0,
        ),

        videoCount: Number(
          channel.statistics?.videoCount ?? 0,
        ),

        likes: totalLikes,

        comments: totalComments,

        snapshotDate: today,
      };
      console.log('SNAPSHOT:', channelSnapshot);

      // =====================================
      // 5. ACTUALIZAR O CREAR
      // =====================================

      const existingSnapshot =
        await this.snapshotRepository.findOne({
          where: {
            channelId,
            snapshotDate: today,
          },
        });

      if (existingSnapshot) {
        existingSnapshot.channelTitle =
          channelSnapshot.channelTitle;

        existingSnapshot.subscribers =
          channelSnapshot.subscribers;

        existingSnapshot.totalViews =
          channelSnapshot.totalViews;

        existingSnapshot.videoCount =
          channelSnapshot.videoCount;

        existingSnapshot.likes =
          channelSnapshot.likes;

        existingSnapshot.comments =
          channelSnapshot.comments;

        await this.snapshotRepository.save(
          existingSnapshot,
        );

        console.log(
          'Snapshot actualizado correctamente',
        );
      } else {
        const snapshotEntity =
          this.snapshotRepository.create(
            channelSnapshot,
          );

        await this.snapshotRepository.save(
          snapshotEntity,
        );

        console.log(
          'Snapshot creado correctamente',
        );
      }

      return {
        message:
          'Snapshot procesado correctamente',

        channelSnapshot,

        videos,
      };
    } catch (error: any) {
      console.error(
        'ERROR REAL:',
        error?.response?.data || error.message,
      );

      throw error;
    }
  }

  // =====================================
  // 📊 LISTAR SNAPSHOTS
  // =====================================

  async findAllSnapshots() {
    return this.snapshotRepository.find({
      order: {
        snapshotDate: 'DESC',
      },
    });
  }
}