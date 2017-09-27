import 'reflect-metadata';
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
import { IconComponent } from 'app/shared/icons/icon.component';
import { SubcategoryListComponent } from 'app/pages/fields/subcategories/subcategory-list.component';
import { SubcategoriesComponent } from 'app/pages/fields/subcategories/subcategories.component';
import { CategoriesService } from 'app/services/categories.service';
import { CategoryDetailComponent } from 'app/pages/fields/categories/category-detail.component';
import { OperatorListComponent } from 'app/pages/fields/operators/operator-list.component';
import { OperatorDetailComponent } from 'app/pages/fields/operators/operator-detail.component';
import { CountryListComponent } from 'app/pages/fields/countries/country-list.component';
import { CountryDetailComponent } from 'app/pages/fields/countries/country-detail.component';
import { SpeciesListComponent } from 'app/pages/fields/species/species-list.component';
import { SpeciesService } from 'app/services/species.service';
import { ObserverListComponent } from 'app/pages/fields/observers/observer-list.component';
import { WebWorkerService } from 'app/services/webworker.service';
import { Base64FileInputDirective } from 'app/directives/base64-file-input.directive';
import { ActionBarComponent } from 'app/shared/action-bar/action-bar.component';
import { SpeciesDetailComponent } from 'app/pages/fields/species/species-detail.component';
import { ObserverDetailComponent } from 'app/pages/fields/observers/observer-detail.component';
import { GovernmentDetailComponent } from 'app/pages/fields/governments/government-detail.component';
import { GovernmentListComponent } from 'app/pages/fields/governments/government-list.component';
import { OperatorsService } from 'app/services/operators.service';
import { ObserversService } from 'app/services/observers.service';
import { GovernmentsService } from 'app/services/governments.service';
import { CategoryListComponent } from 'app/pages/fields/categories/category-list.component';
import { HeaderComponent } from 'app/shared/header/header.component';
import { NavigationComponent } from 'app/shared/navigation/navigation.component';
import { UserDetailComponent } from 'app/pages/users/user-detail.component';
import { UsersService } from 'app/services/users.service';
import { TabsComponent } from 'app/shared/tabs/tabs.component';
import { ObservationDetailComponent } from 'app/pages/observations/observation-detail.component';
import { FieldListComponent } from 'app/pages/fields/field-list.component';
import { FieldDetailComponent } from 'app/pages/fields/field-detail.component';
import { ProfileComponent } from 'app/pages/profile/profile.component';
import { UserListComponent } from 'app/pages/users/user-list.component';
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
import { OauthRequestOptions } from 'app/services/oauth-request.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonApiModule } from 'angular2-jsonapi';
import { HttpModule, RequestOptions } from '@angular/http';
import { SpinnerModule } from 'angular2-spinner/dist';
import { DatePickerModule } from 'ng2-datepicker';
import { ObservationsService } from 'app/services/observations.service';
import { MaxTabletDirective, MinTabletDirective } from 'app/directives/responsive.directive';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

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
    UserListComponent,
    UserDetailComponent,
    ProfileComponent,
    FieldListComponent,
    FieldDetailComponent,
    TabsComponent,
    NavigationComponent,
    NavigationItemDirective,
    HeaderComponent,
    GovernmentListComponent,
    GovernmentDetailComponent,
    ObserverDetailComponent,
    ObserverListComponent,
    SpeciesDetailComponent,
    SpeciesListComponent,
    CategoryListComponent,
    CategoryDetailComponent,
    ActionBarComponent,
    CountryDetailComponent,
    CountryListComponent,
    OperatorDetailComponent,
    OperatorListComponent,
    SubcategoryListComponent,
    SubcategoriesComponent,
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
    Base64FileInputDirective
  ],
  imports: [
    JsonApiModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    SpinnerModule,
    DatePickerModule,
    LeafletModule.forRoot(),
    MultiselectDropdownModule
  ],
  providers: [
    TokenService,
    AuthService,
    AlreadyLoggedGuard,
    GovernmentsService,
    CountriesService,
    DatastoreService,
    UsersService,
    ObservationsService,
    SubcategoriesService,
    ObserversService,
    OperatorsService,
    SpeciesService,
    CategoriesService,
    ObservationReportsService,
    ObservationDocumentsService,
    LawsService,
    SeveritiesService,
    ResponsiveService,
    WebWorkerService,
    { provide: RequestOptions, useClass: OauthRequestOptions }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
