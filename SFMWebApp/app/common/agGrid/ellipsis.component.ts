import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular/main';

@Component({
    selector: 'ellipsis-cell',
    template: `<i class="fa fa-ellipsis-h fa-lg"></i>`
})
export class EllipsisComponent implements ICellRendererAngularComp {
    //public params: any;

    agInit(): void {
        //this.params = params;
    }
}