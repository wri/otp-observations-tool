import { ObservationComponent } from 'app/pages/observation/observation.component';
import { FieldsComponent } from 'app/pages/fields/fields.component';
import { ProfileComponent } from 'app/pages/profile/profile.component';
import { UsersComponent } from 'app/pages/users/users.component';
import { BottombarComponent } from 'app/shared/bottombar/bottombar.component';
import { SidebarComponent } from 'app/shared/sidebar/sidebar.component';
import { DatastoreService } from 'app/services/datastore.service';
import { CountriesService } from 'app/services/countries.service';
import { RegisterComponent } from 'app/pages/register/register.component';
import { ObservationsComponent } from 'app/pages/observations/observations.component';
import { AuthService, TokenService } from 'app/services/auth.service';
import { LoginComponent } from 'app/pages/login/login.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonApiModule } from 'angular2-jsonapi';
import { HttpModule, RequestOptions } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';
import { OauthRequestOptions } from 'app/services/oauth-request.service';
import { CustomFormsModule } from 'ng2-validation';
import { AppComponent } from './app.component';
import { SpinnerModule } from 'angular2-spinner/dist';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ObservationsComponent,
    ObservationComponent,
    RegisterComponent,
    SidebarComponent,
    BottombarComponent,
    UsersComponent,
    ProfileComponent,
    FieldsComponent
  ],
  imports: [
    JsonApiModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    CustomFormsModule,
    SpinnerModule
  ],
  providers: [
    TokenService,
    AuthService,
    CountriesService,
    DatastoreService,
    { provide: RequestOptions, useClass: OauthRequestOptions }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
