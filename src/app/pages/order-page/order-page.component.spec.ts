import { TestBed } from '@angular/core/testing';
import { OrderPageComponent } from './order-page.component';

describe('OrderPageComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPageComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(OrderPageComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });
});
