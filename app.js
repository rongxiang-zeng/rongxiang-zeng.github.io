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
  const details = project.querySelector('details');
  if (details) details.open = true;
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

// A small, decorative spatial graphic. No user data or external requests.
(() => {
  const canvas = document.getElementById('research-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, visible = true, phase = 0, last = 0;
  const corners = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    const cx = width * .53, cy = height * .5, scale = height * .255;
    const yaw = .45 + t * .22, pitch = -.35 + Math.sin(t * .25) * .12;
    const project = ([x,y,z]) => {
      const rx = x * Math.cos(yaw) + z * Math.sin(yaw);
      const rz = -x * Math.sin(yaw) + z * Math.cos(yaw);
      const ry = y * Math.cos(pitch) - rz * Math.sin(pitch);
      const depth = y * Math.sin(pitch) + rz * Math.cos(pitch);
      const perspective = 4 / (4 + depth * .35);
      return [cx + rx * scale * perspective, cy + ry * scale * perspective, depth];
    };
    const points = corners.map(project);
    ctx.lineWidth = 1;
    edges.forEach(([a,b]) => {
      ctx.strokeStyle = `rgba(32,91,84,${.27 + (points[a][2] + points[b][2] + 3) * .06})`;
      ctx.beginPath();ctx.moveTo(points[a][0],points[a][1]);ctx.lineTo(points[b][0],points[b][1]);ctx.stroke();
    });
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * 2 / 5 + t * .15;
      const x = cx + Math.cos(angle) * width * .40;
      const y = cy + Math.sin(angle) * height * .33;
      const p = points[(i * 3) % points.length];
      ctx.strokeStyle = 'rgba(32,91,84,.13)';ctx.setLineDash([2,4]);
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(p[0],p[1]);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(32,91,84,.48)';ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();
      const progress = (t * .16 + i * .21) % 1;
      ctx.fillStyle = 'rgba(32,91,84,.52)';ctx.beginPath();ctx.arc(x+(p[0]-x)*progress,y+(p[1]-y)*progress,1.4,0,Math.PI*2);ctx.fill();
    }
    points.forEach(([x,y,z]) => {
      ctx.fillStyle = '#f9f9f6';ctx.beginPath();ctx.arc(x,y,3.2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle = `rgba(32,91,84,${.55+(z+2)*.09})`;ctx.beginPath();ctx.arc(x,y,2.1,0,Math.PI*2);ctx.fill();
    });
  }
  function tick(now) {
    if (last) phase += Math.min(now-last,50)/1000;
    last=now;draw(phase);frame=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);last=0;draw(phase);
    if (visible && !document.hidden && !reduced.matches) frame=requestAnimationFrame(tick);
  }
  function resize() {
    const box=canvas.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2);
    width=box.width;height=box.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);draw(phase);
  }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(canvas);
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  resize();sync();
})();

(() => {
  const url = 'https://rongxiang-zeng.github.io/';
  const title = 'Rongxiang Zeng | Robot Learning, World Models & Spatial Intelligence';
  const dialog = document.getElementById('wechat-dialog');
  const trigger = document.getElementById('wechat-share');
  const status = document.getElementById('share-status');
  trigger.addEventListener('click', () => { dialog.querySelector('.dialog-share-status').textContent=''; dialog.showModal(); });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r=dialog.getBoundingClientRect();
    if (e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => trigger.focus());
  document.querySelectorAll('[data-copy-homepage]').forEach(button => button.addEventListener('click', async () => {
    const notice=dialog.open ? dialog.querySelector('.dialog-share-status') : status;
    try {
      await navigator.clipboard.writeText(url);
      notice.textContent='Link copied. Ready to share.';
    } catch {
      const input=dialog.open ? document.getElementById('wechat-url') : document.getElementById('share-fallback');
      input.hidden=false;input.focus();input.select();
      notice.textContent='Select and copy the homepage link.';
    }
  }));
  const native=document.getElementById('native-share');
  if (navigator.share) {
    native.hidden=false;
    native.addEventListener('click', async () => {
      try { await navigator.share({title,url}); }
      catch (error) { if (error.name !== 'AbortError') status.textContent='Use Copy link to share this page.'; }
    });
  }
})();
