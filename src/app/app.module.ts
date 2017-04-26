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

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ObservationsComponent,
    RegisterComponent
  ],
  imports: [
    JsonApiModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    CustomFormsModule
  ],
  providers: [
    TokenService,
    AuthService,
    { provide: RequestOptions, useClass: OauthRequestOptions }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
