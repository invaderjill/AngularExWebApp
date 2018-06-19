import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular/main';

@Component({
    selector: 'date-cell',
    template: `{{params.value | date:'yMMMd'}}`
})
export class DateComponent implements ICellRendererAngularComp {
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }
}