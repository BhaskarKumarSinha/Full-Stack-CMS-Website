import ContactForm from "../components/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question or want to work together? We'd love to hear from
            you. Fill out the form below and we'll get back to you as soon as
            possible.
          </p>
        </div>

        <ContactForm
          email="your-email@gmail.com"
          linkedin="https://linkedin.com/in/your-profile-username"
          title="Send us a Message"
          subtitle="We typically respond within 24 hours"
        />
      </div>
    </div>
  );
}
