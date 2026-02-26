import { useEffect } from 'react';

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">About Me</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Who I Am</h2>
            <p>
              I'm Kunal Patil, an AI Engineer passionate about building innovative solutions using artificial intelligence and machine learning. This portfolio showcases my journey, projects, and learnings in the field of technology.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What I Do</h2>
            <p className="mb-2">
              I specialize in developing AI-powered applications and solutions. My expertise includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Machine Learning and Deep Learning</li>
              <li>Natural Language Processing</li>
              <li>Full-stack Web Development</li>
              <li>Cloud Computing and DevOps</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">My Mission</h2>
            <p>
              Through this website, I aim to share my knowledge, document my learning journey, and showcase projects that demonstrate the practical applications of AI and software engineering. I believe in continuous learning and contributing to the tech community.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p>
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision. Feel free to reach out through the contact section on the homepage.
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
