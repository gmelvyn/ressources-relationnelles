import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivitiesModule } from './activities/activities.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { FavoritesModule } from './favorites/favorites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgressModule } from './progress/progress.module';
import { RelationTypesModule } from './relation-types/relation-types.module';
import { ResourcesModule } from './resources/resources.module';
import { SearchModule } from './search/search.module';
import { SettingsModule } from './settings/settings.module';
import { StatisticsModule } from './statistics/statistics.module';
import { UploadsModule } from './uploads/uploads.module';

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
    ConfigModule.forRoot({ envFilePath: `.${process.env.NODE_ENV}.env` }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
