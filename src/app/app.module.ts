import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FloorPlanComponent } from './floor-plan/floor-plan.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HttpClientModule } from '@angular/common/http';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapComponent } from './google-map/google-map.component';
import { AppRoutingModule } from './app-routing.module';
import { ConfigAccessPointsComponent } from './config-access-points/config-access-points.component';
import { UploadedFloorPlanService } from './uploaded-floor-plan.service';
import { DisplayDevicesComponent } from './display-devices/display-devices.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserLogoutComponent } from './user-logout/user-logout.component';
import { UnauthorizedViewComponent } from './unauthorized-view/unauthorized-view.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ConfirmPasswordComponent } from './confirm-password/confirm-password.component';  
import { AngularMultiSelectModule } from 'angular4-multiselect-dropdown/angular4-multiselect-dropdown';
import { RolesPanelComponent } from './roles-panel/roles-panel.component';
import * as $ from 'jquery';
import { SubscriberTracingComponent } from './subscriber-tracing/subscriber-tracing.component';
import { ChartsModule } from 'ng2-charts';
import { MatInputModule, MatTableModule, MatToolbarModule, MatSortModule } from '@angular/material';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StConfigurationComponent } from './st-configuration/st-configuration.component';
import { PathLocationStrategy,HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    FloorPlanComponent,
    GoogleMapComponent,
    ConfigAccessPointsComponent,
    DisplayDevicesComponent,
    UserLoginComponent,
    UserLogoutComponent,
    UnauthorizedViewComponent,
    AdminPanelComponent,
    SuperAdminComponent,
    ResetPasswordComponent,
    ConfirmPasswordComponent,
    RolesPanelComponent,
    SubscriberTracingComponent,
    StConfigurationComponent    
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AngularMultiSelectModule,    
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatToolbarModule,     
    MatPaginatorModule,
    MatSortModule,
    MatInputModule, 
    MatTableModule,
    ChartsModule,
    MatCheckboxModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    //LoggerModule.forRoot({serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.ERROR}),  
    LoggerModule.forRoot({ level: environment.production === true? NgxLoggerLevel.LOG :
      environment.production === false ? NgxLoggerLevel.DEBUG : NgxLoggerLevel.INFO,
      serverLogLevel: NgxLoggerLevel.OFF }),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDvPv3hoRfCxWWl7Bu0yzXP7k1KfT1llEs',
      libraries: ["places"]
    }),
    AppRoutingModule
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
  exports: [MatToolbarModule, MatInputModule, MatSortModule, MatTableModule, MatSlideToggleModule],
  bootstrap: [ AppComponent ]
})
export class AppModule { }