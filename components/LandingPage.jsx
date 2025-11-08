'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Sparkles, Brain, Zap, Search, Mic, Image, Link } from 'lucide-react';

// Dynamically import 3D component (prevents SSR issues)
const NeuralNetwork3D = dynamic(() => import('./NeuralNetwork3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse text-purple-500">Loading 3D...</div>
    </div>
  ),
});

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Classification',
    description: 'Claude AI automatically understands and categorizes your content',
    color: 'text-purple-500',
  },
  {
    icon: Mic,
    title: 'Voice Notes',
    description: 'Record thoughts with Whisper transcription and keyword extraction',
    color: 'text-pink-500',
  },
  {
    icon: Image,
    title: 'Vision Analysis',
    description: 'OCR, diagram understanding, and color detection for images',
    color: 'text-blue-500',
  },
  {
    icon: Search,
    title: 'Semantic Search',
    description: 'Find anything with natural language queries',
    color: 'text-indigo-500',
  },
  {
    icon: Zap,
    title: 'Instant Capture',
    description: 'Chrome extension for one-click content saving',
    color: 'text-yellow-500',
  },
  {
    icon: Link,
    title: 'Smart Metadata',
    description: 'Auto-extracts titles, authors, prices, and more',
    color: 'text-green-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export default function LandingPage({ onEnter }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* 3D Background */}
        <div className="absolute inset-0 opacity-40">
          <NeuralNetwork3D />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/50 to-slate-950/90"></div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Floating Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Powered by Claude AI</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Project Synapse
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Build the <span className="text-purple-400 font-semibold">Brain</span> You've Always Wanted
          </motion.p>

          <motion.p
            className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            An intelligent second brain that captures, understands, and retrieves your thoughts across any medium
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={onEnter}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-semibold shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: 'spring' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Enter Your Brain</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>

          {/* Stats */}
          <motion.div
            className="mt-16 flex justify-center gap-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <div>
              <div className="text-3xl font-bold text-purple-400">AI-Powered</div>
              <div className="text-sm text-gray-400">Classification</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-400">Instant</div>
              <div className="text-sm text-gray-400">Capture</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">Natural</div>
              <div className="text-sm text-gray-400">Search</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-purple-400 rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Superpowers for Your Mind
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to build your second brain
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative p-8 rounded-2xl bg-slate-900/50 border border-purple-500/10 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300 hover:scale-105"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20 backdrop-blur-sm overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to Upgrade Your Brain?
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Start capturing, understanding, and retrieving your thoughts like never before
              </p>
              <motion.button
                onClick={onEnter}
                className="px-8 py-4 bg-white text-purple-900 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Now
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-6 border-t border-purple-500/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>Built for Appointy Internship Drive 2025</p>
          <p className="text-sm mt-2">Powered by Claude AI, Next.js, and React Three Fiber</p>
        </div>
      </footer>
    </div>
  );
}
