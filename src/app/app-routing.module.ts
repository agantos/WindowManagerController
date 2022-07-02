import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WindowManagerComponent } from './window-manager/window-manager.component';

const routes: Routes = [
  { path: 'window-manager', component: WindowManagerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
