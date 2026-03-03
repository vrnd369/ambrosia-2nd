function SectionTen() {
  const text = "No Spikes. No Crashes. Just you at your best."

  return (
    <section className="section-ten">
      <div className="marquee">
        <div className="marquee-content">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="marquee-item">{text}&nbsp;&nbsp;</span>
          ))}
        </div>
        <div className="marquee-content marquee-content--duplicate" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="marquee-item">{text}&nbsp;&nbsp;</span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SectionTen
