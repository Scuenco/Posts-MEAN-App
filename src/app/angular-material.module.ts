/* This module will import things from the Angular material package
   and export them again. */
import { NgModule } from "@angular/core";
import { MatInputModule,
  MatCardModule,
  MatButtonModule,
  MatToolbarModule,
  MatExpansionModule,
  MatProgressSpinnerModule,
  MatPaginatorModule,
  MatDialogModule } from '@angular/material';

@NgModule({
  // imports: the importing will be done automatically by Angular.
  exports: [ // to make them usable in another module, we add exports key
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDialogModule
  ]
})
export class AngularMaterialModule {}
