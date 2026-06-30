import React from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Reveal from '../components/common/Reveal';

interface LegalLayoutProps {
  children: ReactNode;
  title: string;
  lastUpdated: string;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ children, title, lastUpdated }) => {
  return (
    <div className="min-h-screen py-20 px-6 md:px-16 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-4xl mx-auto">
        <Reveal direction="down" delay={200}>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </Reveal>

        <header className="mb-16">
          <Reveal direction="up" delay={400}>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              {title}
            </h1>
          </Reveal>
          <Reveal direction="up" delay={500}>
            <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
              Last Updated: {lastUpdated}
            </p>
          </Reveal>
        </header>

        <Reveal direction="up" delay={600}>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            <article className="prose prose-invert prose-blue max-w-none 
              prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
              prose-p:text-white/70 prose-p:leading-relaxed prose-p:text-lg
              prose-li:text-white/70 prose-strong:text-blue-400 prose-a:text-blue-400 hover:prose-a:text-blue-300
              prose-hr:border-white/10"
            >
              {children}
            </article>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default LegalLayout;
