import 'reflect-metadata';
import { SeveritiesService } from 'app/services/severities.service';
import { LawsService } from 'app/services/laws.service';
import { ObservationDocumentsService } from 'app/services/observation-documents.service';
import { ObservationReportsService } from 'app/services/observation-reports.service';
import { PageNotFoundComponent } from 'app/pages/page-not-found/page-not-found.component';
import { SubcategoriesService } from 'app/services/subcategories.service';
import { ResponsiveService } from 'app/services/responsive.service';
import { AlreadyLoggedGuard } from 'app/services/already-logged.guard';
import { UserRoleGuard } from 'app/services/user-role.guard';
import { CategoriesService } from 'app/services/categories.service';
import { OperatorsService } from 'app/services/operators.service';
import { ObserversService } from 'app/services/observers.service';
import { GovernmentsService } from 'app/services/governments.service';
import { HeaderComponent } from 'app/shared/header/header.component';
import { UsersService } from 'app/services/users.service';
import { FmusService } from 'app/services/fmus.service';
import { BottombarComponent } from 'app/shared/bottom-bar/bottom-bar.component';
import { DatastoreService } from 'app/services/datastore.service';
import { CountriesService } from 'app/services/countries.service';
import { AuthService } from 'app/services/auth.service';
import { TokenService } from 'app/services/token.service';
import { LoginComponent } from 'app/pages/login/login.component';
import { AppComponent } from 'app/app.component';
import { AppRoutingModule } from 'app/app-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { JsonApiModule } from '@michalkotas/angular2-jsonapi';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ObservationsService } from 'app/services/observations.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { apiInterceptorProvider } from 'app/services/api-interceptor';

import * as Sentry from '@sentry/browser'
import { RewriteFrames } from '@sentry/integrations'

import { environment } from 'environments/environment';

Sentry.init({
  dsn: environment.SENTRY_DSN,
  environment: (() => {
    if (environment.apiUrl.includes('staging')) return 'staging';

    return environment.production ? 'production' : 'development';
  })(),
  integrations: [
    new RewriteFrames(),
  ],
})

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error) {
    Sentry.captureException(error.originalError || error);
    console.error(error)
  }
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/locale/', '.json');
}

@NgModule({
  // Only the app shell, the login screen and the 404 page are eager. Every feature area is
  // declared in its own lazily loaded module (see AppRoutingModule).
  declarations: [
    AppComponent,
    HeaderComponent,
    BottombarComponent,
    LoginComponent,
    PageNotFoundComponent
  ],
  imports: [
    JsonApiModule,
    BrowserModule,
    SharedModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  // Services stay in the root injector so lazy modules share the same singletons.
  providers: [
    TokenService,
    AuthService,
    AlreadyLoggedGuard,
    UserRoleGuard,
    GovernmentsService,
    CountriesService,
    DatastoreService,
    UsersService,
    ObservationsService,
    SubcategoriesService,
    ObserversService,
    FmusService,
    OperatorsService,
    CategoriesService,
    ObservationReportsService,
    ObservationDocumentsService,
    LawsService,
    SeveritiesService,
    ResponsiveService,
    apiInterceptorProvider,
    { provide: ErrorHandler, useClass: SentryErrorHandler }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
