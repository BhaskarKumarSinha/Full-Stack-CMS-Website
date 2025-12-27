import mongoose from "mongoose";
import PageModel from "../models/Page";
import { config } from "../config";

const pages = [
  {
    slug: "home",
    path: "/",
    title: "Home - Expert Web Developer | Full Stack Solutions",
    status: "published",
    layout: [
      {
        type: "html",
        props: {
          html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home - Expert Web Developer | Full Stack Solutions</title>
  <meta name="description" content="Hire a professional web developer for custom web applications, full stack development, and digital solutions. Expert in React, Node.js, and modern technologies.">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto; line-height: 1.6; color: #333; }
    .nav { position: sticky; top: 0; z-50; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .nav-brand { font-weight: bold; font-size: 1.5rem; color: #2563eb; }
    .nav-links { display: flex; gap: 2rem; }
    .nav-links a { color: #374151; text-decoration: none; transition: color 0.3s; }
    .nav-links a:hover { color: #2563eb; }
    .section { padding: 5rem 2rem; max-width: 80rem; margin: 0 auto; }
    .hero { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 8rem 2rem; text-align: center; }
    .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
    .hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.95; }
    .hero-btn { padding: 0.75rem 2rem; background: white; color: #2563eb; border: none; border-radius: 0.5rem; font-weight: bold; cursor: pointer; margin: 0.5rem; }
    .features { background: #f9fafb; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
    .feature-card { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .feature-card h3 { color: #2563eb; margin-bottom: 1rem; }
    .feature-icon { width: 3rem; height: 3rem; background: #dbeafe; border-radius: 0.5rem; margin-bottom: 1rem; }
    .testimonials { background: white; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
    .testimonial { background: #f3f4f6; padding: 2rem; border-radius: 0.5rem; border-left: 4px solid #2563eb; }
    .cta { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; text-align: center; }
    .cta h2 { font-size: 2.5rem; margin-bottom: 1.5rem; }
    .cta-btn { padding: 0.75rem 2rem; background: white; color: #2563eb; border: none; border-radius: 0.5rem; font-weight: bold; cursor: pointer; }
    .footer { background: #111827; color: #d1d5db; padding: 4rem 2rem; }
    .footer-content { max-width: 80rem; margin: 0 auto; }
    .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem; margin-bottom: 2rem; }
    .footer-section h4 { color: white; font-weight: bold; margin-bottom: 1rem; }
    .footer-section ul { list-style: none; }
    .footer-section a { color: #9ca3af; text-decoration: none; }
    .footer-bottom { border-top: 1px solid #374151; padding-top: 2rem; text-align: center; }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-brand">WebDev Pro</div>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/services">Services</a>
      <a href="/contact">Contact</a>
    </div>
  </nav>

  <section class="hero">
    <h1>Expert Full Stack Web Developer</h1>
    <p>Building powerful web applications with modern technologies</p>
    <button class="hero-btn">Get Started</button>
    <button class="hero-btn">Learn More</button>
  </section>

  <section class="section features">
    <h2 style="text-align: center; font-size: 2rem; margin-bottom: 3rem;">Why Choose Me</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon"></div>
        <h3>Expert Development</h3>
        <p>Professional full stack development with React, Node.js, and modern frameworks. I deliver high-quality, scalable solutions.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"></div>
        <h3>Performance Optimized</h3>
        <p>Fast loading times and optimized code. I focus on SEO-friendly development and best practices for web performance.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"></div>
        <h3>24/7 Support</h3>
        <p>Dedicated support for all your projects. I'm available for consultation, maintenance, and ongoing improvements.</p>
      </div>
    </div>
  </section>

  <section class="section testimonials">
    <h2 style="text-align: center; font-size: 2rem; margin-bottom: 3rem;">Client Testimonials</h2>
    <div class="testimonials-grid">
      <div class="testimonial">
        <p>"Outstanding web developer. Delivered exactly what we needed on time and on budget."</p>
        <p style="margin-top: 1rem; font-weight: bold;">- Tech Startup CEO</p>
      </div>
      <div class="testimonial">
        <p>"Professional, responsive, and incredibly skilled. Highly recommended for any web project."</p>
        <p style="margin-top: 1rem; font-weight: bold;">- Small Business Owner</p>
      </div>
      <div class="testimonial">
        <p>"Best investment for our digital presence. The site is fast, beautiful, and converts."</p>
        <p style="margin-top: 1rem; font-weight: bold;">- E-commerce Manager</p>
      </div>
    </div>
  </section>

  <section class="section cta">
    <h2>Ready to Start Your Project?</h2>
    <p style="font-size: 1.1rem; margin-bottom: 2rem;">Let's build something amazing together</p>
    <button class="cta-btn">Contact Me Today</button>
  </section>

  <footer class="footer">
    <div class="footer-content">
      <div class="footer-grid">
        <div class="footer-section">
          <h4>Services</h4>
          <ul>
            <li><a href="/services">Web Development</a></li>
            <li><a href="/services">App Development</a></li>
            <li><a href="/services">Consulting</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Company</h4>
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/">Home</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 WebDev Pro. All rights reserved.</p>
      </div>
    </div>
  </footer>
</body>
</html>`,
        },
      },
    ],
    seo: {
      metaTitle: "Home - Expert Web Developer | Full Stack Solutions",
      metaDescription:
        "Hire a professional web developer for custom web applications, full stack development, and digital solutions.",
    },
  },
  {
    slug: "about",
    path: "/about",
    title: "About - Professional Web Developer with 5+ Years Experience",
    status: "published",
    layout: [
      {
        type: "html",
        props: {
          html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About - Professional Web Developer with 5+ Years Experience</title>
  <meta name="description" content="Learn about my journey as a full stack web developer. 5+ years of experience building scalable web applications with React, Node.js, and modern technologies.">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto; line-height: 1.6; color: #333; }
    .nav { position: sticky; top: 0; z-50; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .nav-brand { font-weight: bold; font-size: 1.5rem; color: #2563eb; }
    .nav-links { display: flex; gap: 2rem; }
    .nav-links a { color: #374151; text-decoration: none; transition: color 0.3s; }
    .nav-links a:hover { color: #2563eb; }
    .section { padding: 5rem 2rem; max-width: 80rem; margin: 0 auto; }
    .about-header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 4rem 2rem; text-align: center; }
    .about-header h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    .about-content { background: white; padding: 3rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-top: 2rem; }
    .about-content h2 { color: #2563eb; margin-top: 2rem; margin-bottom: 1rem; }
    .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-top: 2rem; }
    .skill-card { background: #f3f4f6; padding: 2rem; border-radius: 0.5rem; border-left: 4px solid #2563eb; }
    .skill-card h3 { color: #2563eb; margin-bottom: 0.5rem; }
    .footer { background: #111827; color: #d1d5db; padding: 4rem 2rem; margin-top: 4rem; }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-brand">WebDev Pro</div>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/services">Services</a>
      <a href="/contact">Contact</a>
    </div>
  </nav>

  <section class="about-header">
    <h1>About Me</h1>
    <p>Professional Full Stack Web Developer</p>
  </section>

  <section class="section">
    <div class="about-content">
      <h2>My Journey</h2>
      <p>With over 5 years of professional experience, I've built and maintained numerous web applications for startups, SMEs, and established enterprises. My passion for clean code and user-centered design drives every project.</p>
      
      <p style="margin-top: 1rem;">I specialize in full stack development, creating end-to-end solutions from frontend interfaces to backend infrastructure. I'm committed to staying updated with the latest technologies and best practices in web development.</p>

      <h2>Core Expertise</h2>
      <div class="skills-grid">
        <div class="skill-card">
          <h3>Frontend Development</h3>
          <p>React, Vue.js, TypeScript, Responsive Design, CSS-in-JS, Web Performance</p>
        </div>
        <div class="skill-card">
          <h3>Backend Development</h3>
          <p>Node.js, Express, MongoDB, PostgreSQL, REST APIs, GraphQL</p>
        </div>
        <div class="skill-card">
          <h3>DevOps & Deployment</h3>
          <p>Docker, AWS, Google Cloud, CI/CD, Git, Linux</p>
        </div>
        <div class="skill-card">
          <h3>Best Practices</h3>
          <p>SEO Optimization, Performance Tuning, Security, Testing, Code Quality</p>
        </div>
      </div>

      <h2>Why Work With Me</h2>
      <ul style="margin-left: 2rem; margin-top: 1rem;">
        <li>Professional communication and regular updates</li>
        <li>Scalable, maintainable code architecture</li>
        <li>SEO-optimized solutions</li>
        <li>Performance-focused development</li>
        <li>Post-launch support and maintenance</li>
      </ul>

      <h2>Let's Connect</h2>
      <p>If you have a project in mind or want to discuss web development, I'd love to hear from you. <a href="/contact" style="color: #2563eb; text-decoration: none;">Get in touch</a> today!</p>
    </div>
  </section>

  <footer class="footer">
    <div style="max-width: 80rem; margin: 0 auto;">
      <p>&copy; 2024 WebDev Pro. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`,
        },
      },
    ],
    seo: {
      metaTitle: "About - Professional Web Developer with 5+ Years Experience",
      metaDescription:
        "Learn about my journey as a full stack web developer with 5+ years of experience building scalable web applications.",
    },
  },
  {
    slug: "services",
    path: "/services",
    title: "Services - Web Development, App Development & Consulting",
    status: "published",
    layout: [
      {
        type: "html",
        props: {
          html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Services - Web Development, App Development & Consulting</title>
  <meta name="description" content="Professional web development services including custom web apps, mobile development, consulting, and maintenance. Full stack solutions for startups and enterprises.">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto; line-height: 1.6; color: #333; }
    .nav { position: sticky; top: 0; z-50; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .nav-brand { font-weight: bold; font-size: 1.5rem; color: #2563eb; }
    .nav-links { display: flex; gap: 2rem; }
    .nav-links a { color: #374151; text-decoration: none; transition: color 0.3s; }
    .nav-links a:hover { color: #2563eb; }
    .section { padding: 5rem 2rem; max-width: 80rem; margin: 0 auto; }
    .services-header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 4rem 2rem; text-align: center; }
    .services-header h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem; }
    .service-card { background: white; padding: 2.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 4px solid #2563eb; }
    .service-card h3 { color: #2563eb; margin-bottom: 1rem; font-size: 1.3rem; }
    .service-card ul { margin-left: 2rem; margin-top: 1rem; }
    .service-card li { margin-bottom: 0.5rem; }
    .footer { background: #111827; color: #d1d5db; padding: 4rem 2rem; }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-brand">WebDev Pro</div>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/services">Services</a>
      <a href="/contact">Contact</a>
    </div>
  </nav>

  <section class="services-header">
    <h1>My Services</h1>
    <p>Comprehensive web development solutions for your business</p>
  </section>

  <section class="section">
    <div class="services-grid">
      <div class="service-card">
        <h3>🚀 Custom Web Development</h3>
        <p>Build high-performance, scalable web applications tailored to your business needs. I use modern frameworks and best practices to ensure your web app is fast, secure, and user-friendly.</p>
        <ul>
          <li>Full stack web applications</li>
          <li>Single Page Applications (SPA)</li>
          <li>Progressive Web Apps (PWA)</li>
          <li>Real-time applications</li>
        </ul>
      </div>

      <div class="service-card">
        <h3>📱 Mobile App Development</h3>
        <p>Create powerful mobile applications that work seamlessly across devices. I specialize in React Native for cross-platform development and native solutions when needed.</p>
        <ul>
          <li>React Native apps</li>
          <li>iOS and Android development</li>
          <li>App API development</li>
          <li>App maintenance & updates</li>
        </ul>
      </div>

      <div class="service-card">
        <h3>💼 E-commerce Solutions</h3>
        <p>Build and optimize e-commerce platforms that convert visitors into customers. From product catalogs to payment integrations, I handle all aspects of online retail.</p>
        <ul>
          <li>Shopify & WooCommerce setup</li>
          <li>Custom e-commerce platforms</li>
          <li>Payment gateway integration</li>
          <li>Inventory management systems</li>
        </ul>
      </div>

      <div class="service-card">
        <h3>🔍 SEO & Performance Optimization</h3>
        <p>Make your website visible to search engines and fast for users. I optimize for both Google rankings and exceptional user experience.</p>
        <ul>
          <li>Technical SEO</li>
          <li>Performance optimization</li>
          <li>Mobile optimization</li>
          <li>Core Web Vitals improvement</li>
        </ul>
      </div>

      <div class="service-card">
        <h3>🛠️ Maintenance & Support</h3>
        <p>Keep your website running smoothly with ongoing maintenance, updates, and support. I provide timely bug fixes and performance improvements.</p>
        <ul>
          <li>Regular updates & patches</li>
          <li>Bug fixes & troubleshooting</li>
          <li>Performance monitoring</li>
          <li>Security updates</li>
        </ul>
      </div>

      <div class="service-card">
        <h3>💡 Consulting & Strategy</h3>
        <p>Get expert advice on technology selection, architecture, and best practices. I help businesses make informed decisions about their web development needs.</p>
        <ul>
          <li>Technology stack selection</li>
          <li>Architecture design</li>
          <li>Code review & optimization</li>
          <li>Team mentoring</li>
        </ul>
      </div>
    </div>

    <h2 style="margin-top: 4rem; text-align: center; font-size: 2rem;">Ready to Get Started?</h2>
    <p style="text-align: center; margin-top: 1rem; margin-bottom: 2rem;">Contact me to discuss your project and find the perfect solution.</p>
  </section>

  <footer class="footer">
    <div style="max-width: 80rem; margin: 0 auto;">
      <p>&copy; 2024 WebDev Pro. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`,
        },
      },
    ],
    seo: {
      metaTitle: "Services - Web Development, App Development & Consulting",
      metaDescription:
        "Professional web development services including custom web apps, mobile development, e-commerce solutions, SEO optimization, and maintenance.",
    },
  },
];

async function seedPages() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete existing pages with these paths
    await PageModel.deleteMany({
      path: { $in: ["/", "/about", "/services"] },
    });
    console.log("Cleared existing pages");

    // Insert new pages
    const result = await PageModel.insertMany(pages);
    console.log(`Successfully created ${result.length} pages`);

    console.log("Pages created:");
    result.forEach((page) => {
      console.log(`  - ${page.title} (${page.path})`);
    });

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding pages:", error);
    process.exit(1);
  }
}

seedPages();
