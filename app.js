const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!expanded));
  navigation.classList.toggle('is-open', !expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
}));
function filterGroup(buttonAttribute, itemsSelector, categoryAttribute, liveSelector, noun) {
  const buttons = document.querySelectorAll(`[${buttonAttribute}]`);
  const items = document.querySelectorAll(itemsSelector);
  const show = value => {
    let count = 0;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.getAttribute(buttonAttribute) === value)));
    items.forEach(item => {
      item.hidden = value !== 'all' && item.getAttribute(categoryAttribute) !== value;
      if (!item.hidden) count++;
    });
    document.querySelector(liveSelector).textContent = `Showing ${count} ${count === 1 ? noun.slice(0,-1) : noun}`;
  };
  buttons.forEach(button => button.addEventListener('click', () => show(button.getAttribute(buttonAttribute))));
  return show;
}
const showResearch = filterGroup('data-research-filter', '.research-item', 'data-category', '#research-count', 'projects');
filterGroup('data-publication-filter', '.publication', 'data-kind', '#publication-count', 'publications');
function revealLinkedProject() {
  if (!location.hash.startsWith('#project-')) return;
  const project = document.getElementById(location.hash.slice(1));
  if (!project) return;
  showResearch('all');
  project.querySelector('details').open = true;
  requestAnimationFrame(() => project.scrollIntoView({block:'start'}));
}
window.addEventListener('hashchange', revealLinkedProject);
revealLinkedProject();
document.querySelectorAll('.copy-citation').forEach(button => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.citation);
      document.querySelector('#copy-status').textContent = 'Citation copied to clipboard.';
      button.textContent = 'Copied ✓';
      setTimeout(() => { button.textContent = 'Copy citation'; }, 2200);
    } catch {
      document.querySelector('#copy-status').textContent = button.dataset.citation;
    }
  });
});
const sectionLinks = [...navigation.querySelectorAll('a')];
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    sectionLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${entry.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
    });
  });
}, {rootMargin:'-10% 0px -65% 0px', threshold:0});
sectionLinks.forEach(link => { const section = document.querySelector(link.getAttribute('href')); if(section) observer.observe(section); });

// Load third-party players only after a visitor chooses to play a demo.
document.querySelectorAll('.video-preview').forEach(button => {
  button.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${button.dataset.video}?autoplay=1`;
    iframe.title = button.dataset.videoTitle;
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    iframe.className = 'video-player';
    button.replaceWith(iframe);
    iframe.focus();
  });
});
