import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;

  function render(status: string): HTMLElement {
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.status');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StatusBadgeComponent] });
    fixture = TestBed.createComponent(StatusBadgeComponent);
  });

  it('shows a readable label and a colour class for a known status', () => {
    const badge = render('PENDING_MATERIAL');

    expect(badge.textContent).toBe('Pending material');
    expect(badge.classList).toContain('status-pending_material');
  });

  it('falls back to the raw value for an unknown status', () => {
    expect(render('SOMETHING_NEW').textContent).toBe('SOMETHING_NEW');
  });
});
