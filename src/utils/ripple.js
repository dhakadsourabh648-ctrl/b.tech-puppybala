/**
 * Click ripple animation utility that creates a smooth expanding wave
 * from the exact cursor/touch coordinate on any clicked element.
 */
export function triggerClickRipple(e, color = 'rgba(255, 255, 255, 0.45)') {
  const target = e.currentTarget;
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const circle = document.createElement('span');
  const diameter = Math.max(rect.width, rect.height) * 1.5;
  const radius = diameter / 2;

  const x = e.clientX ? e.clientX - rect.left - radius : rect.width / 2 - radius;
  const y = e.clientY ? e.clientY - rect.top - radius : rect.height / 2 - radius;

  circle.style.width = `${diameter}px`;
  circle.style.height = `${diameter}px`;
  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;
  circle.style.backgroundColor = color;
  circle.className = 'click-ripple';

  // Ensure target has relative positioning and hidden overflow for containing the ripple
  if (getComputedStyle(target).position === 'static') {
    target.style.position = 'relative';
  }
  if (getComputedStyle(target).overflow !== 'hidden') {
    target.style.overflow = 'hidden';
  }

  target.appendChild(circle);
  setTimeout(() => {
    circle.remove();
  }, 600);
}
