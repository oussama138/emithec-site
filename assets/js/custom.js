(function () {
  const el  = document.getElementById('rotatingWord');
  const bar = document.querySelector('.rot-bar');
  if (!el || !bar || !window.gsap || !window.Splitting) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const words       = ['VIE.', 'FORME.', 'SENS.'];
  const DELETE_STEP = 0.07;
  const TYPE_STEP   = 0.09;
  const HOLD        = 2.2;
  let index = 0;

  function split(word) {
    el.textContent = word;
//     const [result] = Splitting({ target: el, by: 'chars' });
    const [result] = Splitting({ target: el, by: 'chars', force: true });
    return Array.from(result.chars);
  }

  const wait = (s) => new Promise((r) => gsap.delayedCall(s, r));
  const play = (tl) => new Promise((r) => tl.eventCallback('onComplete', r));
  const setTyping = (on) => bar.classList.toggle('typing', on); // stops the blink

  function erase(chars) {
    const tl = gsap.timeline();
    tl.call(setTyping, [true]);
    chars.slice().reverse().forEach((c, i) => {
      const t = i * DELETE_STEP;
      tl.to(c, { opacity: 0, duration: 0.08, ease: 'none' }, t)
        .set(c, { display: 'none' }, t + 0.08);
    });
    tl.call(setTyping, [false]);
    return tl;
  }
 
  function write(chars) {
    gsap.set(chars, { display: 'none', opacity: 0, x: -10 });
    const tl = gsap.timeline();
    tl.call(setTyping, [true]);
    chars.forEach((c, i) => {
      const t = i * TYPE_STEP;
      tl.set(c, { display: 'inline-block' }, t)
        .to(c, { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }, t);
    });
    tl.call(setTyping, [false]);
    return tl;
  }

  let chars = split(words[0]);

  (async function loop() {
    await wait(HOLD);
    while (true) {
      await play(erase(chars));
      index = (index + 1) % words.length;
      chars = split(words[index]);
      await play(write(chars));
      await wait(HOLD);
    }
  })();
})();
