<script setup>

import { Instagram,Facebook,Twitter } from 'lucide-vue-next';
</script>
<template>
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Forever</h4>
          <p>Create your perfect wedding website with ease.</p>
        </div>

        <div class="footer-col">
          <h4>Features</h4>
          <ul>
            <li><a href="#">Wedding Websites</a></li>
            <li><a href="#">Guest Management</a></li>
            <li><a href="#">Registry</a></li>
            <li><a href="#">Planning Tools</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Planning Guide</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Support</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-social">
        <!-- Replace with real icons or libraries like FontAwesome -->
        <a href="#" aria-label="Instagram" class="icon"><Instagram /></a>
        <a href="#" aria-label="Facebook" class="icon"><Facebook /></a>
        <a href="#" aria-label="Twitter" class="icon"><Twitter /></a>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2025 <strong>Forever</strong>. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>


<style scoped>
footer {
  background-color: #fafafa;
  padding: 60px 0 30px;
  color: #444;
  border-top: 1px solid #eee;
  font-family: 'Segoe UI', sans-serif;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-col h4 {
  font-size: 1.15rem;
  margin-bottom: 16px;
  font-weight: 600;
  color: var(--accent-color, #cc3366);
}

.footer-col p {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
}

.footer-col ul {
  list-style: none;
  padding: 0;
}

.footer-col ul li {
  margin-bottom: 10px;
}

.footer-col a {
  text-decoration: none;
  color: #555;
  font-size: 0.95rem;
  transition: color 0.3s, transform 0.2s;
}

.footer-col a:hover {
  color: var(--accent-color, #cc3366);
  transform: translateX(3px);
}

.footer-social {
  text-align: center;
  margin-bottom: 20px;
}

.footer-social .icon {
  display: inline-block;
  margin: 0 10px;
  font-size: 1.4rem;
  color: #888;
  transition: color 0.3s ease;
}

.footer-social .icon:hover {
  color: var(--accent-color, #cc3366);
}

.footer-bottom {
  text-align: center;
  border-top: 1px solid #ddd;
  padding-top: 20px;
  font-size: 0.85rem;
  color: #999;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  footer {
    padding: 40px 20px 20px;
  }

  .footer-grid {
    gap: 30px;
  }

  .footer-col h4 {
    font-size: 1.05rem;
  }

  .footer-col a,
  .footer-col p {
    font-size: 0.9rem;
  }
}

</style>
