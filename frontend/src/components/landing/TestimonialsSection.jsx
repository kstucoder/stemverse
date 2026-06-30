export default function TestimonialsSection() {
  return (
    <section className="section-pad tint" id="testimonials">
      <div className="wrap">
        <div className="head center">
          <span className="eyebrow">Oilalar sevadi</span>
          <h2>Ota-onalar va o'qituvchilar nima deydi</h2>
        </div>
        <div className="test-grid">
          <div className="tcard glass reveal">
            <span className="role">Ota-ona</span>
            <div className="stars">★★★★★</div>
            <p className="quote">"U video aylantirishdan haqiqiy zanjir yig'ishga o'tdi. Endi menga kechki ovqatda servo haqida tushuntiradi."</p>
            <div className="who"><div className="av">N</div><div><b>Nodira K.</b><span>12 yoshli farzand onasi</span></div></div>
          </div>
          <div className="tcard glass reveal">
            <span className="role">O'qituvchi</span>
            <div className="stars">★★★★★</div>
            <p className="quote">"Butun sinfim reytingda. Darslikda hech ko'rmagan qiziqishni ko'rdim."</p>
            <div className="who"><div className="av">S</div><div><b>Sardor B.</b><span>STEM o'qituvchisi</span></div></div>
          </div>
          <div className="tcard glass reveal">
            <span className="role">Ota-ona</span>
            <div className="stars">★★★★★</div>
            <p className="quote">"O'yinga o'xshaydi, lekin u haqiqatan elektronikani o'rganyapti. Yilning eng yaxshi xaridi."</p>
            <div className="who"><div className="av">D</div><div><b>Dilnoza R.</b><span>11 yoshli farzand onasi</span></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
