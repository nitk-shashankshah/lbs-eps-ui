import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesPanelComponent } from './roles-panel.component';

describe('RolesPanelComponent', () => {
  let component: RolesPanelComponent;
  let fixture: ComponentFixture<RolesPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RolesPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
