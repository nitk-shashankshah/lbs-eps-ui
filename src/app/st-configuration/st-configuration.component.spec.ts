import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StConfigurationComponent } from './st-configuration.component';

describe('StConfigurationComponent', () => {
  let component: StConfigurationComponent;
  let fixture: ComponentFixture<StConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
