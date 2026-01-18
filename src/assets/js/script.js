
document.addEventListener('DOMContentLoaded', function () {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
  
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', function () {
        this.classList.toggle('active');
  
        if (mainNav) {
          mainNav.style.display = mainNav.style.display === 'block' ? 'none' : 'block';
        }
  
        // Animate hamburger to X
        const spans = this.querySelectorAll('span');
        if (this.classList.contains('active')) {
          spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
          spans[1].style.opacity = '0';
          spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
          spans[0].style.transform = 'none';
          spans[1].style.opacity = '1';
          spans[2].style.transform = 'none';
        }
      });
    }
  
    // Filter Buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', function () {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
  
        // You can add filtering logic here
      });
    });
  
    // Mobile Dropdown Handling
    function handleMobileDropdowns() {
      if (window.innerWidth <= 576) {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
          const link = dropdown.querySelector('a');
          if (link) {
            link.addEventListener('click', function (e) {
              e.preventDefault();
              const content = this.nextElementSibling;
              if (content) {
                const isOpen = content.style.display === 'block';
                document.querySelectorAll('.dropdown-content').forEach(el => {
                  el.style.display = 'none';
                });
                content.style.display = isOpen ? 'none' : 'block';
              }
            });
          }
        });
      }
    }
  
    handleMobileDropdowns();
    window.addEventListener('resize', handleMobileDropdowns);
  
    // Animate background elements
    const flowers = document.querySelectorAll('.flower');
    const circles = document.querySelectorAll('.circle');
  
    function animateBackgroundElements() {
      flowers.forEach(flower => {
        const randomDelay = Math.random() * 2;
        const randomDuration = 8 + Math.random() * 4;
        flower.style.animationDelay = `${randomDelay}s`;
        flower.style.animationDuration = `${randomDuration}s`;
      });
  
      circles.forEach(circle => {
        const randomDelay = Math.random() * 3;
        const randomDuration = 10 + Math.random() * 5;
        circle.style.animationDelay = `${randomDelay}s`;
        circle.style.animationDuration = `${randomDuration}s`;
      });
    }
  
    animateBackgroundElements();
  
    // Add parallax effect on scroll
    window.addEventListener('scroll', function () {
      const scrollPosition = window.scrollY;
  
      flowers.forEach((flower, index) => {
        const speed = 0.05 + (index * 0.02);
        flower.style.transform = `translateY(${scrollPosition * speed}px)`;
      });
  
      circles.forEach((circle, index) => {
        const speed = 0.03 + (index * 0.01);
        circle.style.transform = `translateY(${scrollPosition * speed}px)`;
      });
    });
  
    // Template hover effects
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
      card.addEventListener('mouseenter', function () {
        const img = this.querySelector('img');
        if (img) img.style.transform = 'scale(1.05)';
      });
  
      card.addEventListener('mouseleave', function () {
        const img = this.querySelector('img');
        if (img) img.style.transform = 'scale(1)';
      });
    });
  });
  
  