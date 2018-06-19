import { Component, animate, transition, style, state, trigger, HostBinding, Inject, Input, OnDestroy, OnInit } from '@angular/core';

import { AccordionComponent } from './accordion.component';

/* tslint:disable-next-line */
const MouseEvent = (global as any).MouseEvent as MouseEvent;

/* tslint:disable:component-selector-name */
@Component({
    selector: 'accordion-group, accordion-panel',
    template: `
     <div class="panel card panel-default" [ngClass]="{'isActive' : isActive }">
       <div class="panel-heading card-header" [ngClass]="headingClass" (click)="toggleOpen($event)">
           <div role="button" class="accordion-toggle" [attr.aria-expanded]="isOpen">
             <div *ngIf="heading"[ngClass]="{'text-muted': isDisabled}">{{heading}}</div>
        <ng-content select="[accordion-heading]"></ng-content>
           </div>
       </div>
<div class="panel-collapse collapse" [collapse]="!isOpen" (expanded)="expanded($event)" (collapsed)="collapsed($event)" [@expandedState]="expandedState">
         <div class="panel-body card-block">
           <ng-content></ng-content>
         </div>
       </div>
     </div>`,
	animations: [
        		trigger('expandedState', [
            			state('closed', style({ height: 0 })),
            			state('open', style({ height: '*' })),
                        transition('closed => open', animate('300ms ease-in', style({ height: '*' }))),
                        transition('open => closed', animate('300ms ease-out', style({ height: 0 })))
            		])
        	]
 })
export class AccordionPanelComponent implements OnInit, OnDestroy {
    @Input() public heading: string;
    @Input() public panelClass: string;
    @Input() public headingClass: string;
    @Input() public isDisabled: boolean;
    @Input() public isActive: boolean;
    @Input() expandedState: string = "closed";

    // Questionable, maybe .panel-open should be on child div.panel element?
    @HostBinding('class.panel-open')
    
    @Input()
    public get isOpen():boolean {
    return this._isOpen;
    }

    public set isOpen(value:boolean) {
        this._isOpen = value;
        if (value) {
            this.accordion.closeOtherPanels(this);
        }
    }
 
   protected _isOpen: boolean;
   protected accordion: AccordionComponent;
 
   public constructor(@Inject(AccordionComponent) accordion: AccordionComponent) {
        this.accordion = accordion;
    }
 
   public ngOnInit():any {
       this.panelClass = this.panelClass || 'panel-default';
       this.headingClass = this.headingClass || '';
       this.isActive = (this.isActive != null || this.isActive != undefined) ? this.isActive : false;
       this.accordion.addGroup(this);
    }
 
   public ngOnDestroy():any {
        this.accordion.removeGroup(this);
    }

    	public expanded(e):void {
		let _obj = this;
    		setTimeout(() => {
        			_obj.expandedState = 'open';
        		}, 4);
    	}
    
        public collapsed(e):void {
		let _obj = this;
    		setTimeout(() => {
        			_obj.expandedState = 'closed';
        		}, 4);
    	}
    
        public toggleOpen(event: Event):any {
            event.preventDefault();
            if (!this.isDisabled) {
                this.isOpen = !this.isOpen;
            }
        }
}