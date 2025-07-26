import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountHome } from './account-home';

describe('AccountHome', () => {
  let component: AccountHome;
  let fixture: ComponentFixture<AccountHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
