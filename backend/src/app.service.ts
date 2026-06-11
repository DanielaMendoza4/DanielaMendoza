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

  async getHello() {
    const apiKey =
      this.configService.get<string>('YOUTUBE_API_KEY');

    const channelId =
      'UCSoRbSrehYFqx6n-6uyio0w';

    const uploadsPlaylistId =
      'UUSoRbSrehYFqx6n-6uyio0w';

    // =====================================
    // 1. Obtener videos del canal
    // =====================================

    const playlistUrl =
      `https://www.googleapis.com/youtube/v3/playlistItems` +
      `?part=snippet` +
      `&playlistId=${uploadsPlaylistId}` +
      `&maxResults=10` +
      `&key=${apiKey}`;

    const playlistResponse =
      await axios.get(playlistUrl);

    // =====================================
    // 2. Extraer IDs de videos
    // =====================================

    const videoIds =
      playlistResponse.data.items.map(
        (item: any) =>
          item.snippet.resourceId.videoId,
      );

    // =====================================
    // 3. Obtener estadísticas de videos
    // =====================================

    const videosUrl =
      `https://www.googleapis.com/youtube/v3/videos` +
      `?part=statistics,snippet` +
      `&id=${videoIds.join(',')}` +
      `&key=${apiKey}`;

    const videosResponse =
      await axios.get(videosUrl);

    // =====================================
    // 4. Normalizar videos
    // =====================================

    const videos =
      videosResponse.data.items.map(
        (video: any) => ({
          videoId: video.id,
          title: video.snippet.title,
          views: Number(
            video.statistics.viewCount ?? 0,
          ),
          likes: Number(
            video.statistics.likeCount ?? 0,
          ),
          comments: Number(
            video.statistics.commentCount ?? 0,
          ),
          publishedAt:
            video.snippet.publishedAt,
        }),
      );

    // =====================================
    // 5. Obtener estadísticas del canal
    // =====================================

    const channelUrl =
      `https://www.googleapis.com/youtube/v3/channels` +
      `?part=snippet,statistics` +
      `&id=${channelId}` +
      `&key=${apiKey}`;

    const channelResponse =
      await axios.get(channelUrl);

    const channel =
      channelResponse.data.items[0];

    // =====================================
    // 6. Fecha de hoy
    // =====================================

    const today =
      new Date().toISOString().split('T')[0];

    // =====================================
    // 7. Normalizar channelSnapshot
    // =====================================

    const channelSnapshot = {
      channelId,

      channelTitle:
        channel.snippet.title,

      subscribers: Number(
        channel.statistics
          .subscriberCount ?? 0,
      ),

      totalViews: Number(
        channel.statistics.viewCount ??
        0,
      ),

      videoCount: Number(
        channel.statistics.videoCount ??
        0,
      ),

      snapshotDate: today,
    };

    // =====================================
    // 8. Verificar si ya existe snapshot
    // =====================================

    const existingSnapshot =
      await this.snapshotRepository.findOne({
        where: {
          channelId,
          snapshotDate: today,
        },
      });

    // =====================================
    // 9. Guardar snapshot si no existe
    // =====================================

    if (!existingSnapshot) {
      const snapshot =
        this.snapshotRepository.create(
          channelSnapshot,
        );

      await this.snapshotRepository.save(
        snapshot,
      );
    }

    // =====================================
    // 10. Respuesta final
    // =====================================

    return {
      message:
        'Snapshot guardado correctamente',

      channelSnapshot,

      videos,
    };
  }
}