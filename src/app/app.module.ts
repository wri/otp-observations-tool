import 'reflect-metadata';
import { ReportLibraryDetailComponent } from 'app/pages/my-otp/report-library/report-library-detail.component';
import { FormattedDateComponent } from 'app/shared/formatted-date/formatted-date.component';
import { TagComponent } from 'app/shared/tag/tag.component';
import { SeveritiesService } from 'app/services/severities.service';
import { LawListComponent } from 'app/pages/fields/laws/law-list.component';
import { LawDetailComponent } from 'app/pages/fields/laws/law-detail.component';
import { SeverityListComponent } from 'app/pages/fields/severities/severity-list.component';
import { ReportLibraryComponent } from 'app/pages/my-otp/report-library/report-library.component';
import { LawsService } from 'app/services/laws.service';
import { ObservationDocumentsService } from 'app/services/observation-documents.service';
import { ObservationReportsService } from 'app/services/observation-reports.service';
import { ModalComponent } from 'app/shared/modal/modal.component';
import { FiltersComponent } from 'app/shared/filters/filters.component';
import { FilterDirective } from 'app/shared/filters/directives/filter.directive';
import { NavigationItemDirective } from 'app/shared/navigation/directives/item/item.directive';
import { PageNotFoundComponent } from 'app/pages/page-not-found/page-not-found.component';
import { LoaderComponent } from 'app/shared/loader/loader.component';
import { ObservationsComponent } from 'app/pages/observations/observations.component';
import { SubcategoriesService } from 'app/services/subcategories.service';
import { TableColumnCellDirective } from 'app/shared/table/directives/column/column-cell.directive';
import { TableColumnDirective } from 'app/shared/table/directives/column/column.directive';
import { TableComponent } from 'app/shared/table/table.component';
import { DatepickerComponent } from 'app/shared/datepicker/datepicker.component';
import { MyOTPComponent } from 'app/pages/my-otp/my-otp.component';
import { OrganizationProfileComponent } from 'app/pages/my-otp/profile/organization-profile.component';
import { EqualToValidatorDirective } from 'app/directives/equal-to.directive';
import { EmailValidatorDirective } from 'app/directives/email.directive';
import { NumberValidatorDirective } from 'app/directives/number.directive';
import { ResponsiveService } from 'app/services/responsive.service';
import { AlreadyLoggedGuard } from 'app/services/already-logged.guard';
import { UserRoleGuard } from 'app/services/user-role.guard';
import { IconComponent } from 'app/shared/icons/icon.component';
import { SubcategoryListComponent } from 'app/pages/fields/subcategories/subcategory-list.component';
import { CategoriesService } from 'app/services/categories.service';
import { OperatorListComponent } from 'app/pages/fields/operators/operator-list.component';
import { OperatorDetailComponent } from 'app/pages/fields/operators/operator-detail.component';
import { Base64FileInputDirective } from 'app/directives/base64-file-input.directive';
import { ActionBarComponent } from 'app/shared/action-bar/action-bar.component';
import { GovernmentDetailComponent } from 'app/pages/fields/governments/government-detail.component';
import { GovernmentListComponent } from 'app/pages/fields/governments/government-list.component';
import { OperatorsService } from 'app/services/operators.service';
import { ObserversService } from 'app/services/observers.service';
import { GovernmentsService } from 'app/services/governments.service';
import { CategoryListComponent } from 'app/pages/fields/categories/category-list.component';
import { HeaderComponent } from 'app/shared/header/header.component';
import { NavigationComponent } from 'app/shared/navigation/navigation.component';
import { UsersService } from 'app/services/users.service';
import { FmusService } from 'app/services/fmus.service';
// import { TabsComponent } from 'app/shared/tabs/tabs.component';
import { ObservationDetailComponent } from 'app/pages/observations/observation-detail.component';
import { FieldListComponent } from 'app/pages/fields/field-list.component';
import { FieldDetailComponent } from 'app/pages/fields/field-detail.component';
import { ProfileComponent } from 'app/pages/profile/profile.component';
import { BottombarComponent } from 'app/shared/bottom-bar/bottom-bar.component';
import { DatastoreService } from 'app/services/datastore.service';
import { CountriesService } from 'app/services/countries.service';
import { RegisterComponent } from 'app/pages/register/register.component';
import { ObservationListComponent } from 'app/pages/observations/observation-list.component';
import { AuthService } from 'app/services/auth.service';
import { TokenService } from 'app/services/token.service';
import { LoginComponent } from 'app/pages/login/login.component';
import { AppComponent } from 'app/app.component';
import { AppRoutingModule } from 'app/app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonApiModule } from 'angular2-jsonapi';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { SpinnerModule } from 'angular2-spinner/dist';
import { ObservationsService } from 'app/services/observations.service';
import { MaxTabletDirective, MinTabletDirective } from 'app/directives/responsive.directive';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ResetPasswordComponent } from 'app/pages/reset-password/reset-password.component';
import { UploadFileComponent } from './shared/upload-file/upload-file.component';
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
  declarations: [
    AppComponent,
    LoaderComponent,
    LoginComponent,
    ObservationsComponent,
    ObservationListComponent,
    ObservationDetailComponent,
    RegisterComponent,
    BottombarComponent,
    ProfileComponent,
    FieldListComponent,
    FieldDetailComponent,
    // TabsComponent,
    NavigationComponent,
    NavigationItemDirective,
    HeaderComponent,
    GovernmentListComponent,
    GovernmentDetailComponent,
    CategoryListComponent,
    ActionBarComponent,
    OperatorDetailComponent,
    OperatorListComponent,
    SubcategoryListComponent,
    ReportLibraryComponent,
    LawListComponent,
    LawDetailComponent,
    SeverityListComponent,
    IconComponent,
    MaxTabletDirective,
    MinTabletDirective,
    NumberValidatorDirective,
    EmailValidatorDirective,
    EqualToValidatorDirective,
    MyOTPComponent,
    OrganizationProfileComponent,
    DatepickerComponent,
    TableComponent,
    TableColumnDirective,
    TableColumnCellDirective,
    PageNotFoundComponent,
    FiltersComponent,
    FilterDirective,
    ModalComponent,
    Base64FileInputDirective,
    TagComponent,
    FormattedDateComponent,
    ResetPasswordComponent,
    ReportLibraryDetailComponent,
    UploadFileComponent,
  ],
  imports: [
    JsonApiModule,
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    SpinnerModule,
    LeafletModule.forRoot(),
    MultiselectDropdownModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
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
