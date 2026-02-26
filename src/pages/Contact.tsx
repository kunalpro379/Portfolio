import { useEffect } from 'react';

export default function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Contact</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="mb-6">
              I'd love to hear from you! Whether you have a question, want to collaborate, or just want to say hi, feel free to reach out.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Connect With Me</h2>
            <div className="space-y-4">
              <p>
                You can find me on various platforms. Check out the contact section on the homepage for links to my social media profiles and professional networks.
              </p>
              <p>
                For professional inquiries, collaborations, or project discussions, please use the contact form available on the main page.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Response Time</h2>
            <p>
              I typically respond to messages within 24-48 hours. If you haven't heard back from me, please feel free to send a follow-up message.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}
