const menuButton = document.querySelector('.mobile-menu-button');
const siteNav = document.querySelector('.site-nav');

if (menuButton && siteNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('nav-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
}

const serviceCarousel = document.querySelector('.service-carousel');

if (serviceCarousel) {
  const serviceCards = Array.from(serviceCarousel.querySelectorAll('.service-item'));
  let activeIndex = 0;
  let carouselTimer;

  const setServiceCarouselState = () => {
    serviceCards.forEach((card, index) => {
      card.classList.remove('is-active', 'is-left', 'is-right');

      if (index === activeIndex) {
        card.classList.add('is-active');
        card.setAttribute('aria-current', 'true');
        return;
      }

      card.removeAttribute('aria-current');

      if (index === (activeIndex + 1) % serviceCards.length) {
        card.classList.add('is-left');
      } else {
        card.classList.add('is-right');
      }
    });
  };

  const advanceServiceCarousel = () => {
    activeIndex = (activeIndex + 1) % serviceCards.length;
    setServiceCarouselState();
  };

  const startServiceCarousel = () => {
    window.clearInterval(carouselTimer);
    carouselTimer = window.setInterval(advanceServiceCarousel, 3600);
  };

  if (serviceCards.length === 3) {
    setServiceCarouselState();
    startServiceCarousel();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        window.clearInterval(carouselTimer);
      } else {
        startServiceCarousel();
      }
    });
  }
}
