import { Component, HostBinding, Inject, Input, OnDestroy, OnInit, EventEmitter, Output } from '@angular/core';

import { IDataGridProperty } from './dataGridProperty';
import * as _ from 'lodash';
import * as CommonConstants from '../../common/constants/common.constants';

/* tslint:disable-next-line */
const MouseEvent = (global as any).MouseEvent as MouseEvent;

/* tslint:disable:component-selector-name */
@Component({
    selector: 'sfm-datagrid',
    template: 'app/common/datagrid/datagrid.component.html'
})
export class DataGridComponent implements OnInit, OnDestroy {
    @Input() public gridTitle: string;
    @Input() public gridData: any[];
    @Input() public propertiesList: IDataGridProperty[];
    @Input() public filterQuery: string;
    @Input() public sortBy: string;
    @Input() public sortOrder: string;
    @Input() public rowsOnPage: number;

    @Output() onClicked = new EventEmitter<Event>();

    showingAll: boolean;
    canShowLess: boolean;
    numberOfColumns: number;

    //@HostBinding('')

    public constructor() {
        //@Inject(AccordionComponent) accordion: AccordionComponent
        //this.accordion = accordion;
    }

    public ngOnInit(): any {
        this.gridTitle = this.gridTitle || null;
        this.gridData = this.gridData || [];
        this.propertiesList = this.propertiesList || [];
        this.filterQuery = this.filterQuery || '';
        this.sortBy = this.sortBy || (this.propertiesList.length > 0 ? this.propertiesList[0].sortName : '');
        this.sortOrder = this.sortOrder || 'asc';
        this.numberOfColumns = this.gridData && this.gridData.length > 0 ? _.size(this.gridData[0]) : 0;
        this.rowsOnPage = this.rowsOnPage || CommonConstants.ROWS_ON_PAGE;
        
    }

    public ngOnDestroy(): any {
        
    }

}