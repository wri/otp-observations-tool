import { OperatorsService } from 'app/services/operators.service';
import { ObserversService } from 'app/services/observers.service';
import { GovernmentsService } from 'app/services/governments.service';
import { SubCategoriesService } from 'app/services/sub-categories.service';
import { CategoryListComponent } from './pages/fields/categories/category-list-component';
import { DesktopHeaderComponent } from 'app/shared/desktop-header/desktop-header.component';
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
import { AuthService, TokenService } from 'app/services/auth.service';
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
    DesktopHeaderComponent,
    CategoryListComponent,
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
    { provide: RequestOptions, useClass: OauthRequestOptions }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
