import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SkippedSpool } from './batch.service';
import { SkippedSpoolsComponent } from './skipped-spools.component';

describe('SkippedSpoolsComponent', () => {
  let fixture: ComponentFixture<SkippedSpoolsComponent>;

  function render(spools: SkippedSpool[]): HTMLElement {
    fixture.componentRef.setInput('spools', spools);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SkippedSpoolsComponent],
      providers: [provideRouter([])]
    });
    fixture = TestBed.createComponent(SkippedSpoolsComponent);
  });

  it('groups the spools by reason and lists every missing material of a spool under it', () => {
    const element = render([
      {
        spoolId: 2, isoNo: 'ISO-1001', spoolNo: 'SP-02', reason: 'MATERIAL_SHORTAGE',
        shortages: [
          { materialCode: 'TEE-6IN', required: 1, available: 0 },
          { materialCode: 'BOLT-M20', required: 20, available: 16 }
        ]
      },
      { spoolId: 9, isoNo: 'ISO-1004', spoolNo: 'SP-01', reason: 'ISO_NOT_VERIFIED', shortages: [] }
    ]);

    const titles = Array.from(element.querySelectorAll('h3')).map(title => title.textContent?.trim());
    expect(titles).toEqual(['inventoryShort of material (1)', 'ruleISO not verified (1)']);

    const shortage = element.querySelector('.shortages > li')!.textContent!;
    expect(shortage).toContain('ISO-1001 / SP-02');
    expect(shortage).toContain('TEE-6IN');
    expect(shortage).toContain('short 1');
    expect(shortage).toContain('BOLT-M20');
    expect(shortage).toContain('short 4');
  });

  it('shows a deleted spool as text instead of a broken link', () => {
    const element = render([
      { spoolId: null, isoNo: 'ISO-1001', spoolNo: 'SP-09', reason: 'NO_MATERIALS', shortages: [] }
    ]);

    expect(element.querySelector('a')).toBeNull();
    expect(element.textContent).toContain('ISO-1001 / SP-09');
    expect(element.textContent).toContain('(deleted)');
  });

  it('says so when no spool was left out', () => {
    expect(render([]).textContent).toContain('Every spool waiting to be fabricated was included.');
  });
});
