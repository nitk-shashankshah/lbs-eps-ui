import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FloorPlanComponent } from './floor-plan/floor-plan.component';
import {DisplayDevicesComponent} from './display-devices/display-devices.component';
import {UserLoginComponent} from './user-login/user-login.component';
import {UserLogoutComponent} from './user-logout/user-logout.component';
import {ConfigAccessPointsComponent}  from './config-access-points/config-access-points.component';
import {UnauthorizedViewComponent} from './unauthorized-view/unauthorized-view.component';
import {AdminPanelComponent} from './admin-panel/admin-panel.component';
import {SuperAdminComponent} from './super-admin/super-admin.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {ConfirmPasswordComponent} from './confirm-password/confirm-password.component';
import {RolesPanelComponent} from './roles-panel/roles-panel.component';
import {SubscriberTracingComponent} from './subscriber-tracing/subscriber-tracing.component';
import {StConfigurationComponent} from './st-configuration/st-configuration.component';

const routes: Routes = [
  {path: 'callibrate', component: FloorPlanComponent},
  {path: 'configure', component: ConfigAccessPointsComponent},
  {path: 'display', component: DisplayDevicesComponent},
  {path: 'login', component: UserLoginComponent},
  {path: '', component: UserLoginComponent},
  {path: 'logout', component: UserLogoutComponent},
  {path: 'dashboard', component: UnauthorizedViewComponent},
  {path: 'home', component: UnauthorizedViewComponent},
  {path: 'roles', component: AdminPanelComponent},
  {path: 'super', component: SuperAdminComponent},
  {path: 'reset', component: ResetPasswordComponent},
  {path: 'confirm', component: ConfirmPasswordComponent},
  {path: 'users', component: RolesPanelComponent},
  {path: 'tracing', component: SubscriberTracingComponent},
  {path: 'configuration', component: StConfigurationComponent}
];

@NgModule({
  exports: [ RouterModule ],
  imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule {}

