import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberTracingComponent } from './subscriber-tracing.component';

describe('SubscriberTracingComponent', () => {
  let component: SubscriberTracingComponent;
  let fixture: ComponentFixture<SubscriberTracingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriberTracingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriberTracingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
