import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {AuthInterceptor} from './auth.interceptor';
import {GameListComponent} from './components/game-list/game-list.component';
import {GameCardComponent} from './components/game-card/game-card.component';
import {GameSuggesterComponent} from './components/game-suggester/game-suggester.component';
import { SettingsModalComponent } from './components/settings-modal/settings-modal.component';
@NgModule({
  declarations: [
    AppComponent,
    GameListComponent,
    GameCardComponent,
    GameSuggesterComponent,
    SettingsModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
