import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealmanagementComponent } from './dealmanagement.component';

describe('DealmanagementComponent', () => {
  let component: DealmanagementComponent;
  let fixture: ComponentFixture<DealmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealmanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
