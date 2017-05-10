import { IconComponent } from 'app/shared/icons/icon.component';
import { AnnexGovernanceListComponent } from 'app/pages/fields/subcategories/governance/annex-governance-list.component';
import { AnnexGovernanceDetailComponent } from 'app/pages/fields/subcategories/governance/annex-governance-detail.component';
import { AnnexOperatorListComponent } from 'app/pages/fields/subcategories/operators/annex-operator-list.component';
import { AnnexOperatorDetailComponent } from 'app/pages/fields/subcategories/operators/annex-operator-detail.component';
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
import { LawsService } from 'app/services/laws.service';
import { LawListComponent } from 'app/pages/fields/laws/law-list.component';
import { ActionBarComponent } from 'app/shared/action-bar/action-bar.component';
import { SpeciesDetailComponent } from 'app/pages/fields/species/species-detail.component';
import { ObserverDetailComponent } from 'app/pages/fields/observers/observer-detail.component';
import { LawDetailComponent } from 'app/pages/fields/laws/law-detail.component';
import { GovernmentDetailComponent } from 'app/pages/fields/governments/government-detail.component';
import { GovernmentListComponent } from 'app/pages/fields/governments/government-list.component';
import { OperatorsService } from 'app/services/operators.service';
import { ObserversService } from 'app/services/observers.service';
import { GovernmentsService } from 'app/services/governments.service';
import { SubCategoriesService } from 'app/services/sub-categories.service';
import { CategoryListComponent } from 'app/pages/fields/categories/category-list.component';
import { HeaderComponent } from 'app/shared/header/header.component';
import { NavigationComponent } from 'app/shared/navigation/navigation.component';
import { WrapperComponent } from 'app/shared/wrapper/wrapper.component';
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
import { CustomFormsModule } from 'ng2-validation';
import { SpinnerModule } from 'angular2-spinner/dist';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DatePickerModule } from 'ng2-datepicker';
import { ResponsiveModule } from 'ng2-responsive';
import { ObservationsService } from 'app/services/observations.service';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
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
    WrapperComponent,
    NavigationComponent,
    HeaderComponent,
    GovernmentListComponent,
    GovernmentDetailComponent,
    LawDetailComponent,
    LawListComponent,
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
    SubcategoriesComponent,
    AnnexOperatorDetailComponent,
    AnnexOperatorListComponent,
    AnnexGovernanceDetailComponent,
    AnnexGovernanceListComponent,
    IconComponent
  ],
  imports: [
    JsonApiModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    CustomFormsModule,
    SpinnerModule,
    NgxDatatableModule,
    ResponsiveModule,
    DatePickerModule
  ],
  providers: [
    TokenService,
    AuthService,
    GovernmentsService,
    CountriesService,
    DatastoreService,
    UsersService,
    ObservationsService,
    SubCategoriesService,
    ObserversService,
    OperatorsService,
    SpeciesService,
    LawsService,
    CategoriesService,
    { provide: RequestOptions, useClass: OauthRequestOptions }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
