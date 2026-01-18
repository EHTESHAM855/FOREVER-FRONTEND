<script setup>
import { CreditCard, Smartphone, Wallet, Crown, Gem, Star, Landmark } from 'lucide-vue-next';

const pricingPlans = [
  {
    name: "Basic",
    price: 50,
    duration: "Per Day",
    description: "Perfect for short-term use or events",
    features: [
      "Feature 1",
      "Feature 2",
      "Feature 3",
      "Feature 4"
    ],
    icon: Star
  },
  {
    name: "Premium",
    price: 100,
    duration: "Per Day",
    description: "Best for 2–5 day events or weekend weddings",
    features: [
      "Feature 1",
      "Feature 2",
      "Feature 3",
      "Feature 4"
    ],
    icon: Gem
  },
  {
    name: "Ultimate",
    price: 150,
    duration: "Per Day",
    description: "Ideal for long-term showcase or destination weddings",
    features: [
      "Feature 1",
      "Feature 2",
      "Feature 3",
      "Feature 4"
    ],
    icon: Crown
  }
];
</script>

<template>
  <section class="pricing-page">
    <div class="container">
      <h1 class="page-title">Affordable Plans for Every Wedding</h1>
      <p class="page-subtitle">Start from ₹50/day. Final price depends on duration and features selected.</p>

      <div class="pricing-grid">
        <div class="plan-card" v-for="(plan, index) in pricingPlans" :key="index">
          <div class="plan-header">
            <component :is="plan.icon" class="plan-icon" />
            <h2>{{ plan.name }}</h2>
            <p class="price">Starting at ₹{{ plan.price }} <span>/ {{ plan.duration }}</span></p>
            <p class="plan-description">{{ plan.description }}</p>
          </div>
          <ul class="features-list">
            <li v-for="(feat, idx) in plan.features" :key="idx">✓ {{ feat }}</li>
          </ul>
        </div>
      </div>

      <div class="payment-info">
        <h3>Accepted Payment Methods</h3>
        <p class="payment-subtitle">Choose from secure and convenient options</p>

        <div class="payment-methods">
          <div class="method">
            <CreditCard class="icon" />
            <span>Credit / Debit Cards</span>
            <small>(Visa, MasterCard, RuPay)</small>
          </div>
          <div class="method">
            <Smartphone class="icon" />
            <span>UPI Apps</span>
            <small>(PhonePe, Google Pay, Paytm, BHIM)</small>
          </div>
          <div class="method">
            <Landmark class="icon" />
            <span>Net Banking</span>
            <small>(All major banks supported)</small>
          </div>
          <div class="method">
            <Wallet class="icon" />
            <span>Wallets</span>
            <small>(Paytm, Amazon Pay, etc.)</small>
          </div>
        </div>

        <p class="secure-msg">🔒 100% Secure Payment Gateway | Instant Template Activation</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing-page {
  padding: 4rem 1.5rem;
  background: #f8e7e7;
  min-height: 100vh;
}

.container {
  max-width: 1100px;
  margin: auto;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  color: #000000;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 2rem;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.plan-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  transition: transform 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-5px);
}

.plan-icon {
  width: 40px;
  height: 40px;
  color: #cc3366;
  margin: 0 auto 0.5rem;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #8b757c;
  margin: 0.5rem 0;
}

.plan-description {
  font-size: 0.95rem;
  color: #777;
  margin-bottom: 1rem;
}

.features-list {
  text-align: left;
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
  color: #444;
}

.features-list li {
  margin-bottom: 0.5rem;
}

.payment-info {
  background: linear-gradient(to right, #ffe6f0, #fff0f5);
  padding: 3rem 2rem;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  margin-top: 3rem;
  text-align: center;
}

.payment-info h3 {
  font-size: 2rem;
  color: #000000;
  margin-bottom: 0.5rem;
}

.payment-subtitle {
  color: #555;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.payment-methods {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.method {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  min-width: 220px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.method:hover {
  transform: scale(1.05);
  background-color: #fff8fb;
}

.method .icon {
  width: 30px;
  height: 30px;
  margin-bottom: 0.5rem;
  color: #cc3366;
}

.method span {
  display: block;
  margin-top: 0.3rem;
}

.method small {
  font-size: 0.85rem;
  color: #777;
}

.secure-msg {
  font-size: 1.1rem;
  color: green;
  font-weight: bold;
}
</style>
