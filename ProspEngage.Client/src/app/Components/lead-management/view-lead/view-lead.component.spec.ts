import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLeadComponent } from './view-lead.component';

describe('ViewLeadComponent', () => {
  let component: ViewLeadComponent;
  let fixture: ComponentFixture<ViewLeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewLeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
