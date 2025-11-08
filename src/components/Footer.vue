<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-left">
        <div class="scout-logos">
          <img src="/logos/dds-logo.svg" alt="Det Danske Spejderkorps" class="scout-logo" />
          <img src="/logos/kfum-spejderne.svg" alt="KFUM-Spejderne" class="scout-logo" />
          <img src="/logos/de-groenne.svg" alt="De grønne pigespejdere" class="scout-logo" />
          <img src="/logos/dbs-logo.svg" alt="Danske Baptisters Spejderkorps" class="scout-logo" />
          <img src="/logos/dss-logo.svg" alt="Dansk Spejderkorps Sydslesvig" class="scout-logo" />
        </div>
        <div class="footer-info">
          <p class="copyright">© 2025 Spejdernes Lejr</p>
          <p class="address">Arsenalvej 10, 1436 København K</p>
          <p class="links">
            <a href="mailto:info@sl2026.dk">info@sl2026.dk</a>
            <span class="separator">•</span>
            <a href="https://spejderneslejr.dk/privacy-policy/" target="_blank" rel="noopener">
              Persondatapolitik
            </a>
          </p>
        </div>
      </div>
      <div class="footer-right">
        <img src="/sl2026-camp-logo-positive.svg" alt="Spejdernes Lejr 2026 - Hedeland" class="camp-logo" />
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
}
</script>

<style scoped>
.site-footer {
  background: var(--color-footer-green);
  color: #ffffff;
  padding: var(--spacing-4xl) 0;
  margin-top: 60px;
}

.footer-content {
  max-width: var(--max-width-content);
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4xl);
}

.footer-left {
  flex: 1;
}

.scout-logos {
  display: flex;
  gap: var(--spacing-3xl);
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
  align-items: center;
}

.scout-logo {
  height: 50px;
  width: auto;
  filter: brightness(0) invert(0.85);
}

.scout-logo:nth-child(4) {
  /* DBS logo - no special treatment needed */
  filter: brightness(0) invert(0.85);
}

.footer-info {
  color: #ffffff;
}

.footer-info p {
  margin: var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.copyright,
.address {
  opacity: 0.9;
}

.links a {
  color: var(--color-accent-yellow);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.links a:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.separator {
  margin: 0 var(--spacing-sm);
  opacity: 0.6;
}

.footer-right {
  flex-shrink: 0;
}

.camp-logo {
  height: 120px;
  width: auto;
}

@media (max-width: 768px) {
  .site-footer {
    padding: var(--spacing-3xl) 0;
    margin-top: var(--spacing-4xl);
  }

  .footer-content {
    flex-direction: column;
    padding: 0 var(--spacing-lg);
    gap: var(--spacing-3xl);
    text-align: center;
  }

  .scout-logos {
    justify-content: center;
    gap: var(--spacing-2xl);
    margin-bottom: var(--spacing-xl);
  }

  .scout-logo {
    height: 40px;
  }

  .camp-logo {
    height: 100px;
  }

  .links {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .separator {
    display: none;
  }
}
</style>
