const BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? ''
  : '/kvtogo';

document.querySelectorAll('[href*="BASE_PATH"], [src*="BASE_PATH"], [data-images*="BASE_PATH"], [data-src*="BASE_PATH"]').forEach(el => {
  ['href', 'src', 'data-images', 'data-src'].forEach(attr => {
    if (el.getAttribute(attr)?.includes('BASE_PATH')) {
      el.setAttribute(attr, el.getAttribute(attr).replaceAll('BASE_PATH', BASE));
    }
  });
});

async function loadIncludes() {
  const includeTargets = document.querySelectorAll('[data-include]');
  const requests = Array.from(includeTargets).map(async (el) => {
    const path = el.getAttribute('data-include');
    if (!path) {
      return;
    }
    const response = await fetch(path);
    const html = await response.text();
    const resolved = html.replaceAll('BASE_PATH', BASE);
    el.outerHTML = resolved;
  });
  await Promise.all(requests);
}

function setYear() {
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear().toString();
  }
}

async function renderTeams() {
  const container = document.querySelector('[data-teams]');
  if (!container) {
    return;
  }

  const dataPath = container.getAttribute('data-teams');
  if (!dataPath) {
    return;
  }

  const modal = ensurePhotoModal();

  try {
    const response = await fetch(`${dataPath}?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error('Failed to load teams data');
    }
    const teams = await response.json();
    container.innerHTML = '';

    teams.forEach((team) => {
      const section = document.createElement('article');
      section.className = 'team-section';

      const photo = document.createElement('div');
      if (team.photo) {
        const photoSrc = `${BASE}/${team.photo}`;
        photo.className = 'team-photo team-photo--clickable';
        photo.style.backgroundImage = `url("${photoSrc}")`;
        photo.setAttribute('role', 'button');
        photo.setAttribute('tabindex', '0');
        photo.setAttribute('aria-haspopup', 'dialog');
        photo.addEventListener('click', () => {
          openPhotoModal(modal, photoSrc, team.photoLabel || `Teamfoto ${team.title}`);
        });
        photo.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPhotoModal(modal, photoSrc, team.photoLabel || `Teamfoto ${team.title}`);
          }
        });
      } else {
        photo.className = 'team-photo placeholder';
      }
      photo.setAttribute('aria-label', team.photoLabel || `Teamfoto ${team.title}`);

      const info = document.createElement('div');
      info.className = 'team-info';

      const title = document.createElement('h2');
      title.textContent = team.title;

      const columns = document.createElement('div');
      columns.className = 'team-columns';

      team.columns.forEach((column) => {
        const columnWrap = document.createElement('div');
        const heading = document.createElement('h3');
        heading.textContent = column.label;
        const list = document.createElement('ul');
        list.className = 'team-names';

        column.names.forEach((name) => {
          const item = document.createElement('li');
          item.textContent = name;
          list.appendChild(item);
        });

        columnWrap.appendChild(heading);
        columnWrap.appendChild(list);
        columns.appendChild(columnWrap);
      });

      info.appendChild(title);
      info.appendChild(columns);

      if (team.note) {
        const note = document.createElement('p');
        note.className = 'team-note';
        note.textContent = team.note;
        info.appendChild(note);
      }

      section.appendChild(photo);
      section.appendChild(info);
      container.appendChild(section);
    });
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadIncludes();
  setYear();
  renderTeams();
  initHeroSlideshow();
});

function initHeroSlideshow() {
  const container = document.querySelector('[data-hero-slideshow]');
  if (!container) {
    return;
  }

  const imagesValue = container.getAttribute('data-images') || '';
  const images = imagesValue
    .split('|')
    .map((src) => src.trim())
    .filter(Boolean);

  if (images.length === 0) {
    return;
  }

  const first = document.createElement('img');
  const second = document.createElement('img');
  first.className = 'hero-slideshow__image is-active';
  second.className = 'hero-slideshow__image';
  first.alt = '';
  second.alt = '';
  first.src = images[0];
  second.src = images[1] || images[0];
  container.appendChild(first);
  container.appendChild(second);

  if (images.length === 1) {
    return;
  }

  let currentIndex = 0;
  let activeImage = first;
  let inactiveImage = second;

  setInterval(() => {
    currentIndex = (currentIndex + 1) % images.length;
    inactiveImage.src = images[currentIndex];
    inactiveImage.classList.add('is-active');
    activeImage.classList.remove('is-active');
    const temp = activeImage;
    activeImage = inactiveImage;
    inactiveImage = temp;
  }, 10000);
}

function ensurePhotoModal() {
  let modal = document.getElementById('photo-modal');
  if (modal) {
    return {
      modal,
      image: modal.querySelector('.photo-modal__image'),
    };
  }

  modal = document.createElement('div');
  modal.id = 'photo-modal';
  modal.className = 'photo-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');

  const content = document.createElement('div');
  content.className = 'photo-modal__content';

  const closeButton = document.createElement('button');
  closeButton.className = 'photo-modal__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Sluit foto');
  closeButton.textContent = '×';

  const image = document.createElement('img');
  image.className = 'photo-modal__image';
  image.alt = '';

  content.appendChild(closeButton);
  content.appendChild(image);
  modal.appendChild(content);
  document.body.appendChild(modal);

  const close = () => closePhotoModal({ modal, image });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      close();
    }
  });

  closeButton.addEventListener('click', close);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      close();
    }
  });

  return { modal, image };
}

function openPhotoModal(modalState, src, label) {
  modalState.image.src = src;
  modalState.image.alt = label;
  modalState.modal.classList.add('is-open');
  modalState.modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closePhotoModal(modalState) {
  modalState.modal.classList.remove('is-open');
  modalState.modal.setAttribute('aria-hidden', 'true');
  modalState.image.src = '';
  document.body.classList.remove('modal-open');
}
