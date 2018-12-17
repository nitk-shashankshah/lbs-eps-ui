import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayDevicesComponent } from './display-devices.component';

describe('DisplayDevicesComponent', () => {
  let component: DisplayDevicesComponent;
  let fixture: ComponentFixture<DisplayDevicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayDevicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
