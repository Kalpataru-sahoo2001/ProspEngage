import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectUserComponent } from './reject-user.component';

describe('RejectUserComponent', () => {
  let component: RejectUserComponent;
  let fixture: ComponentFixture<RejectUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
