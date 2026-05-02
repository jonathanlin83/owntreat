(function () {
  const track = document.querySelector('.marquee__track');
  if (!track) return;

  track.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
    const inner = track.querySelector('.marquee__inner');
    if (inner) inner.style.animationPlayState = 'paused';
  });

  track.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
    const inner = track.querySelector('.marquee__inner');
    if (inner) inner.style.animationPlayState = 'running';
  });
})();
