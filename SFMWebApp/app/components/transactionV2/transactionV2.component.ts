import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { GridOptions } from 'ag-grid/main';
import { CurrencyComponent } from '../../common/agGrid/currency.component';
import { DateComponent } from '../../common/agGrid/date.component';
import { EllipsisComponent } from '../../common/agGrid/ellipsis.component';

import { ITransaction } from '../transaction/transaction';
import { UnbilledService } from '../unbilled/unbilled.service';

import { Logging, LogSeverity } from '../../common/logging';
import { AccountStateStore } from '../../common/accountStateStore';

@Component({
    selector: 'sfm-transactionV2',
    templateUrl: 'app/components/transactionV2/transactionV2.component.html'
})
export class TransactionComponentV2 implements OnDestroy {
    unbilledPanelSubscription: Subscription;
    busy: Subscription;
    
    canShowMore: boolean = true;

    public numberOfTransactions: number;
    gridOptions: GridOptions;
    logHelper: Logging = new Logging();

    constructor(private _unbilledService: UnbilledService, private _accountStore: AccountStateStore) {
        this.gridOptions = <GridOptions>{
            context: {
                componentParent: this
            }
        };
        //this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
        this.gridOptions.enableColResize = true;
        this.gridOptions.enableSorting = true;
        this.gridOptions.headerHeight = 30;
        this.gridOptions.rowHeight = 30;
        // tell grid we want virtual row model type
        this.gridOptions.rowModelType = 'virtual';
        // how big each page in our page cache will be, default is 100
        this.gridOptions.paginationPageSize = 50;
        // how many extra blank rows to display to the user at the end of the dataset,
        // which sets the vertical scroll and then allows the grid to request viewing more rows of data.
        // default is 1, ie show 1 row.
        this.gridOptions.paginationOverflowSize = 2;
        // how many server side requests to send at a time. if user is scrolling lots, then the requests
        // are throttled down
        this.gridOptions.maxConcurrentDatasourceRequests = 2;
        // how many rows to initially show in the grid. having 1 shows a blank row, so it looks like
        // the grid is loading from the users perspective (as we have a spinner in the first col)
        this.gridOptions.paginationInitialRowCount = 5;
        // how many pages to store in cache. default is undefined, which allows an infinite sized cache,
        // pages are never purged. this should be set for large data to stop your browser from getting
        // full of data
        this.gridOptions.maxPagesInCache = 2;

        this.unbilledPanelSubscription = this._unbilledService.unbilledTxn$.subscribe(data => this.loadTransactions(data)
            , error => this.logHelper.logMessage("TransactionComponentV2", "constructor", `Error subscribing to episodeSummary.service: ${error}`, LogSeverity.Error));
    }

    private createColumnDefs() {
        return [
            { headerName: "Posted On", field: "postedOn", cellRendererFramework: DateComponent, width: 100},
            { headerName: "Service Date", field: "servicedOn", cellRendererFramework: DateComponent, width: 100 },
            { headerName: "Amount", field: "amount", cellRendererFramework: CurrencyComponent, width: 100 },
            { headerName: "Revenue Code", field: "revenueCode", width: 100 },
            { headerName: "CPT/HCPCS", field: "cptHcpcs", width: 100 },
            { headerName: "Code", field: "transactionCode", width: 100 },
            { headerName: "Description", field: "transactionCodeDescription", width: 200 },
            { headerName: " ", field: "", cellRendererFramework: EllipsisComponent, width: 45}
        ];
    }

    private loadTransactions(transactions: ITransaction[]) {
        if (transactions == null || transactions == undefined || transactions.length == null || transactions.length == undefined || transactions.length < 1) {
            return;
        }

        if (transactions.length < 5) {
            this.canShowMore = false;
        }
        else if (transactions.length == 5) {
            this.canShowMore = true;
        }

        let dataSource = {
            rowCount: transactions.length
            , getRows: function (params: any) {
                // take a slice of the total rows
                var rowsThisPage = transactions.slice(params.startRow, params.endRow);
                // if on or after the last page, work out the last row.
                var lastRow = -1;
                if (transactions.length <= params.endRow) {
                    lastRow = transactions.length;
                }
                // call the success callback
                params.successCallback(rowsThisPage, lastRow);
            }
        }
        this.numberOfTransactions = dataSource.rowCount;
        this.gridOptions.api.setDatasource(dataSource);
    }

    showAll(event: Event) {
        event.stopPropagation();
        this.canShowMore = false;
        let accountState = this._accountStore.accountState[this._accountStore.activePatientID];
        this.busy = this._unbilledService.getAllUnbilledTxn(accountState.activeEpisodeID);
    }

    ngOnDestroy(): void{
        this.unbilledPanelSubscription.unsubscribe();
        this.busy.unsubscribe();
    }
}