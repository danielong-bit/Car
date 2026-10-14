/* Customer photos are past handovers, not current stock or quoted reviews. */
(() => {
  const rail = document.getElementById('customerStoriesRail');
  const dialog = document.getElementById('customerStoryDialog');
  if (!rail || !dialog) return;
  const image = document.getElementById('customerStoryImage');
  const title = document.getElementById('customerStoryTitle');
  const caption = document.getElementById('customerStoryCaption');
  const enquire = document.getElementById('customerStoryEnquire');
  const previous = document.getElementById('storiesPrevious');
  const next = document.getElementById('storiesNext');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function updateControls() {
    previous.disabled = rail.scrollLeft < 4;
    next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 4;
  }
  function move(direction) {
    const card = rail.querySelector('.story-card');
    rail.scrollBy({left:direction * (card.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap)),behavior:reduced.matches?'instant':'smooth'});
  }
  previous.addEventListener('click',()=>move(-1));
  next.addEventListener('click',()=>move(1));
  rail.addEventListener('scroll',updateControls,{passive:true});
  new ResizeObserver(updateControls).observe(rail);
  rail.querySelectorAll('.story-photo').forEach(button=>button.addEventListener('click',()=>{
    const card = button.closest('.story-card');
    const photo = button.querySelector('img');
    image.src = photo.src; image.alt = photo.alt;
    title.textContent = card.querySelector('h3').textContent;
    caption.textContent = card.querySelector('.story-copy p').textContent + ' Past delivery photo; current availability is confirmed by Danny.';
    enquire.href = card.querySelector('.story-enquire').href;
    dialog.showModal();
  }));
  dialog.querySelector('.story-dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if(event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  updateControls();
})();
