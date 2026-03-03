// // import { useEffect, useRef } from 'react';
// // import eyeGif from '../assets/eye.gif';
// // function SectionTwo() {
// //   const sectionRef = useRef(null);

// //   /* Navbar logic removed as sticky-navbar is deleted */
// //   return (
// //     <section className="section-two" ref={sectionRef}>
// //       <img src={eyeGif} alt="Ambrosia Eye" className="section-fullimg" />
// //     </section>
// //   );
// // }

// // export default SectionTwo;

// import { useEffect, useRef } from "react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// gsap.registerPlugin(ScrollTrigger);

// function SectionTwo() {
//   const sectionRef = useRef(null);
//   const imgRef = useRef(null);

//   useEffect(() => {
//     const frameCount = 40;

//     const currentFrame = (index) =>
//       `/eye-seq/eye_${String(index).padStart(4, "0")}.png`;

//     const images = [];
//     const eye = { frame: 0 };

//     // ✅ PRELOAD ALL FRAMES
//     for (let i = 0; i < frameCount; i++) {
//       const img = new Image();
//       img.src = currentFrame(i);
//       images.push(img);
//     }

//     // ✅ WAIT FOR FIRST IMAGE (prevents flash)
//     images[0].onload = () => {
//       if (imgRef.current) {
//         imgRef.current.src = images[0].src;
//       }
//     };

//     // ✅ GSAP SCROLL SCRUB
//     const tween = gsap.to(eye, {
//       frame: frameCount - 1,
//       ease: "none",
//       scrollTrigger: {
//         trigger: sectionRef.current,
//         start: "top center",
//         end: "bottom center",
//         scrub: 0.8, // 🔥 smoothing
//       },
//       onUpdate: () => {
//         const frameIndex = Math.min(
//           frameCount - 1,
//           Math.floor(eye.frame)
//         );

//         if (imgRef.current?.dataset.frame != frameIndex) {
//           imgRef.current.src = images[frameIndex].src;
//           imgRef.current.dataset.frame = frameIndex;
//         }
//       },
//     });

//     return () => {
//       tween.kill();
//       ScrollTrigger.getAll().forEach((t) => t.kill());
//     };
//   }, []);

//   return (
//     <section className="section-two" ref={sectionRef}>
//       <div className="eye-wrapper">
//         <img
//           ref={imgRef}
//           src="/eye-seq/eye_0000.png"
//           alt="Ambrosia Eye"
//           className="section-fullimg"
//         />
//       </div>
//     </section>
//   );
// }

// export default SectionTwo;

// import { useEffect, useRef } from 'react';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// gsap.registerPlugin(ScrollTrigger);

// function SectionTwo() {
//   const sectionRef = useRef(null);
//   const imgRef = useRef(null);

//   useEffect(() => {
//     const frameCount = 80; // 👈 UPDATED (was 40)

//     const currentFrame = index => `/eye-seq/eye_${String(index).padStart(4, '0')}.png`;

//     const images = [];
//     const eye = { frame: 0 };

//     // ✅ PRELOAD ALL FRAMES
//     for (let i = 0; i < frameCount; i++) {
//       const img = new Image();
//       img.src = currentFrame(i);
//       images.push(img);
//     }

//     // ✅ ensure first frame shows cleanly
//     images[0].onload = () => {
//       if (imgRef.current) {
//         imgRef.current.src = images[0].src;
//         imgRef.current.dataset.frame = '0';
//       }
//     };

//     // ✅ GSAP SCROLL SCRUB
//     const tween = gsap.to(eye, {
//       frame: frameCount - 1,
//       ease: 'none',
//       scrollTrigger: {
//         trigger: sectionRef.current,
//         start: 'top center',
//         end: 'bottom center',
//         scrub: 0.8, // 👈 cinematic smooth
//       },
//       onUpdate: () => {
//         const frameIndex = Math.round(eye.frame); // 🔥 IMPORTANT FIX

//         if (imgRef.current && imgRef.current.dataset.frame != frameIndex) {
//           imgRef.current.src = images[frameIndex].src;
//           imgRef.current.dataset.frame = frameIndex;
//         }
//       },
//     });

//     return () => {
//       tween.kill();
//       ScrollTrigger.getAll().forEach(t => t.kill());
//     };
//   }, []);

//   return (
//     <section className="section-two" ref={sectionRef} id='eye'>
//       <div className="eye-wrapper">
//         <img ref={imgRef} src="/eye-seq/eye_0000.png" alt="Ambrosia Eye" className="section-fullimg" />
//       </div>
//     </section>
//   );
// }

// export default SectionTwo;

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Eye0 from '../assets/Eye (1).svg';
import Eye1 from '../assets/Eye (2).svg';
import Eye2 from '../assets/Eye (3).svg';
import Eye3 from '../assets/Eye (4).svg';

gsap.registerPlugin(ScrollTrigger);

function SectionTwo() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const panels = gsap.utils.toArray('.eye-panel');

    gsap.to(panels, {
      yPercent: -100 * (panels.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: true,
        scrub: 1,
        snap: 1 / (panels.length - 1),
        end: () => '+=' + window.innerHeight * panels.length,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} id="eye" className="eye-section">
      <div className="eye-container">
        <div className="eye-panel">
          <img src={Eye0} alt="Eye 0" />
        </div>
        <div className="eye-panel">
          <img src={Eye1} alt="Eye 1" />
        </div>
        <div className="eye-panel">
          <img src={Eye2} alt="Eye 2" />
        </div>
        <div className="eye-panel">
          <img src={Eye3} alt="Eye 3" />
        </div>
      </div>
    </section>
  );
}

export default SectionTwo;
