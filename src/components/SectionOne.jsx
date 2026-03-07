import s1 from '../assets/s-1.webp';

function SectionOne() {
  return (
    <section
      className="section-one"
      style={{
        backgroundImage: `url(${s1})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '120vh',
        width: '100%',
      }}
    >
      <div className="zen-disclaimer">
        <span className="zen-disclaimer-line">Disclaimer: May cause an unusual state</span>
        <span className="zen-disclaimer-line">of focus and stillness.</span>
      </div>
      <a href="#eye" style={{ textDecoration: 'none' }}>
        <button className="zen-btn">Activate Zen Mode</button>
      </a>
    </section>
  );
}

export default SectionOne;
