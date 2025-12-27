import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  image: string;
}

const ChevronLeft = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ChevronRight = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "CEO at TechCorp",
      quote:
        "This platform transformed how we manage our content. Absolutely game-changing!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Marketing Director",
      quote:
        "Easy to use, powerful features, and amazing support. Couldn't ask for more.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    },
    {
      id: 3,
      name: "Emily Davis",
      role: "Product Manager",
      quote:
        "Our team's productivity increased by 40% after switching. Highly recommend!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      role: "Founder & CEO",
      quote:
        "The best investment we made for our digital presence. Outstanding quality.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
  ];

  const portfolioItems: PortfolioItem[] = [
    {
      id: 1,
      title: "E-Commerce Platform",
      category: "Web Design",
      image:
        "https://images.unsplash.com/photo-1460925895917-adf4e11526ab?w=500&h=400&fit=crop",
    },
    {
      id: 2,
      title: "Mobile App Design",
      category: "App Design",
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=400&fit=crop",
    },
    {
      id: 3,
      title: "Brand Identity",
      category: "Branding",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=400&fit=crop",
    },
    {
      id: 4,
      title: "Digital Marketing",
      category: "Marketing",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop",
    },
  ];

  useEffect(() => {
    if (!autoSlide) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % portfolioItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoSlide, portfolioItems.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % portfolioItems.length);
    setAutoSlide(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? portfolioItems.length - 1 : prev - 1
    );
    setAutoSlide(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="font-bold text-2xl text-blue-600">
              CMS Pro
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Testimonials
              </a>
              <a
                href="#portfolio"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Portfolio
              </a>
              <Link
                to="/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Sign In
              </Link>
            </div>
            <button className="md:hidden">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-linear-to-r from-blue-600 to-blue-800 text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Manage Your Content Like Never Before
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8">
                A powerful, intuitive CMS that makes content management simple.
                Create, edit, and publish with ease.
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition transform hover:scale-105">
                  Get Started Free
                </button>
                <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                  Learn More
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-lg transform rotate-6"></div>
                <div className="relative bg-white rounded-lg shadow-2xl p-8">
                  <div className="space-y-4">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-100 rounded mt-6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your content efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6.5L7.5 13h4l-2 4 8-8h-4l2-2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Optimized performance ensures your content loads instantly
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Team Collaboration
              </h3>
              <p className="text-gray-600">
                Work together seamlessly with real-time updates
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 17V3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Advanced Analytics
              </h3>
              <p className="text-gray-600">
                Track performance and gain insights
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Top-Tier Support
              </h3>
              <p className="text-gray-600">
                24/7 dedicated support to help you succeed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their
              workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gray-50 p-8 rounded-lg border border-gray-200"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio/Carousel Section */}
      <section id="portfolio" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Work
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our latest projects and success stories
            </p>
          </div>

          {/* Carousel */}
          <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="relative h-96 md:h-[500px]">
              {portfolioItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    idx === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent flex items-end">
                    <div className="text-white p-8 w-full">
                      <p className="text-sm font-semibold text-blue-300 mb-2">
                        {item.category}
                      </p>
                      <h3 className="text-3xl font-bold">{item.title}</h3>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-900 p-3 rounded-full transition"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-900 p-3 rounded-full transition"
              >
                <ChevronRight />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {portfolioItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSlide(idx);
                      setAutoSlide(false);
                    }}
                    className={`w-3 h-3 rounded-full transition ${
                      idx === currentSlide
                        ? "bg-white w-8"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mt-8">
            {portfolioItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentSlide(idx);
                  setAutoSlide(false);
                }}
                className={`relative h-24 rounded-lg overflow-hidden transition transform ${
                  idx === currentSlide ? "ring-4 ring-blue-600 scale-105" : ""
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary CTA Section */}
      <section className="py-20 bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Revolutionize Your Content Management?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Join thousands of teams. Start your free trial today—no credit card
            required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition transform hover:scale-105 text-lg">
              Start Your Project
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-blue-700 transition text-lg">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">CMS Pro</h3>
              <p className="text-sm text-gray-400">
                The complete content management solution for modern teams.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">
                &copy; 2025 CMS Pro. All rights reserved.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  GitHub
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
