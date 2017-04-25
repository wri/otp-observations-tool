
import { ObservationsComponent } from 'app/pages/observations/observations.component';
import { AuthService, TokenService } from 'app/services/auth.service';
import { LoginComponent } from 'app/pages/login/login.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, RequestOptions } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';
import { OauthRequestOptions } from 'app/services/oauth-request.service';
import { CustomFormsModule } from 'ng2-validation';
import { AppComponent } from './app.component';
import { AuthService, TokenService } from 'app/services/auth.service';
import { LoginComponent } from 'app/pages/login/login.component';
import { ObservationComponent } from 'app/pages/observation/observation.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ObservationsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    CustomFormsModule
  ],
  providers: [
    TokenService,
    AuthService,
    { provide: RequestOptions, useClass: OauthRequestOptions },
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
