import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';

import { CollapseModule } from '../collapse/collapse.module';
import { AccordionPanelComponent } from './accordion-group.component';
import { AccordionComponent } from './accordion.component';
import { AccordionConfig } from './accordion.config';

@NgModule({
  imports: [CommonModule, CollapseModule],
  declarations: [AccordionComponent, AccordionPanelComponent],
  exports: [AccordionComponent, AccordionPanelComponent],
  providers: [AccordionConfig]
})
export class AccordionModule {
  public static forRoot(): ModuleWithProviders {return {ngModule: AccordionModule, providers: [AccordionConfig]};}
}
