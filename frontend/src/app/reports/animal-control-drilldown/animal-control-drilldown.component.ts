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

  columnLabels: { [key: string]: string } = {
    dogID: 'Dog ID',
    breed_label: 'Breed',
    sex: 'Sex',
    alteration_status: 'Altered',
    microchip_id: 'Microchip ID',
    surrender_date: 'Surrender Date',
    surrendered_by_animal_control: 'Surrendered by Animal Control',
    total_expense: 'Total Expense',
    rescue_days: 'Days in Rescue'
  };

  formatCell(col: string, value: any): any {
    // Format date fields
    if (col.toLowerCase().includes('date') && value) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toISOString().split('T')[0]; 
    }
  
    // Format boolean values
    if (col.toLowerCase().includes('alteration') || col.toLowerCase().includes('surrender')) {
      console.log(col, value);
      return value == 1? 'True' : 'False';
    }
  
    return value;
  }

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
