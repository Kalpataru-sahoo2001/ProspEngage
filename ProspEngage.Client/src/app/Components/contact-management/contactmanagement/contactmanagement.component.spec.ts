import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactmanagementComponent } from './contactmanagement.component';

describe('ContactmanagementComponent', () => {
  let component: ContactmanagementComponent;
  let fixture: ComponentFixture<ContactmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactmanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
