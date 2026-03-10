import React from 'react';
import './Buy.css';
import colourfulGrad from '../assets/colourful-grad.webp';
import ProductCarousel from '../components/ProductCarousel';

export default function Buy() {
  return (
    <div className="buy-page">
      <section className="buy-hero" style={{ backgroundImage: `url(${colourfulGrad})` }}>
        <div className="buy-hero-left">
          <h1 className="buy-hero-title">Buy Now</h1>
          <p className="buy-hero-subtitle">Ready to order? Let's get you started.</p>
        </div>

        <div className="buy-hero-right">
        </div>
      </section>

      <ProductCarousel
        withAos={true}
        sectionStyle={{ padding: '2rem 0', backgroundColor: 'transparent' }}
        wrapperStyle={{ maxWidth: '1240px', margin: '0 auto', padding: '0' }}
      />
    </div>
  );
}
