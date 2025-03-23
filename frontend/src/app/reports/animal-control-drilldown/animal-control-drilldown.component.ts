import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-animal-control-drilldown',
  templateUrl: './animal-control-drilldown.component.html',
  styleUrl: './animal-control-drilldown.component.css'
})
export class AnimalControlDrilldownComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AnimalControlDrilldownComponent>
  ) {}

  getColumns(): string[] {
    switch (this.data.type) {
      case 'surrender':
        return ['dogID', 'breed_label', 'sex', 'alteration_status', 'microchip_id', 'surrender_date'];
      case 'sixtyPlus':
        return ['dogID', 'breed_label', 'sex', 'microchip_id', 'surrender_date', 'rescue_days'];
      case 'expenses':
        return ['dogID', 'breed_label', 'sex', 'microchip_id', 'surrender_date', 'surrendered_by_animal_control', 'total_expense'];
      default: return [];
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
