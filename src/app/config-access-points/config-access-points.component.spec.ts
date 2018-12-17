import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigAccessPointsComponent } from './config-access-points.component';

describe('ConfigAccessPointsComponent', () => {
  let component: ConfigAccessPointsComponent;
  let fixture: ComponentFixture<ConfigAccessPointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigAccessPointsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigAccessPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
