import React from 'react';
import '../pages/Buy.css';
import ProductCarousel from './ProductCarousel';

function SectionNine() {
  return (
    <section className="section-carousel section-nine">
      <h2 className="carousel-tagline nine-tagline">
        Discover <span>Your Stillness.</span>
      </h2>
      <ProductCarousel
        withAos={true}
        sectionStyle={{ padding: '2rem 0', backgroundColor: 'transparent' }}
        wrapperStyle={{ maxWidth: '1240px', margin: '0 auto', padding: '0 0.5rem' }}
      />
    </section>
  );
}

export default SectionNine;
