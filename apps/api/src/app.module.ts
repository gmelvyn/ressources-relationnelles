import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { RelationTypesModule } from './relation-types/relation-types.module';
import { ResourcesModule } from './resources/resources.module';
import { CommentsModule } from './comments/comments.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ProgressModule } from './progress/progress.module';
import { ActivitiesModule } from './activities/activities.module';
import { StatisticsModule } from './statistics/statistics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { UploadsModule } from './uploads/uploads.module';
import { SettingsModule } from './settings/settings.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    AuthModule,
    CategoriesModule,
    RelationTypesModule,
    ResourcesModule,
    CommentsModule,
    FavoritesModule,
    ProgressModule,
    ActivitiesModule,
    StatisticsModule,
    NotificationsModule,
    SearchModule,
    UploadsModule,
    SettingsModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
