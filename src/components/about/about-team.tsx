'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Instagram, Linkedin, Heart } from 'lucide-react';

const team = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Chief Ophthalmologist',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop&crop=face',
    bio: '15+ years specializing in dry eye treatment and corneal health.',
  },
  {
    name: 'Michael Roberts',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face',
    bio: 'Named the company after his grandfather Archie, who inspired our commitment to quality.',
  },
  {
    name: 'Dr. Emily Patel',
    role: 'Head of R&D',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=500&fit=crop&crop=face',
    bio: 'PhD in Pharmaceutical Sciences with a passion for clean formulations.',
  },
];

export function AboutTeam() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-32 bg-white overflow-hidden">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-[var(--primary-dark)] mb-4 block">
            The People Behind the Products
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6">
            Meet Our Team
          </h2>
          <p className="text-lg text-[var(--muted-foreground)]">
            A dedicated group of scientists, doctors, and eye care enthusiasts committed to your wellbeing.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.15 }}
              className="group"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Social Icons on Hover */}
                <div className="absolute bottom-6 left-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[var(--foreground)] hover:bg-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[var(--foreground)] hover:bg-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="text-center">
                <h3 className="text-xl font-medium mb-1">{member.name}</h3>
                <p className="text-sm text-[var(--primary-dark)] font-medium mb-3">{member.role}</p>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Join Us Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <div className="relative p-10 md:p-16 bg-gradient-to-br from-[var(--primary-light)] to-[var(--secondary)] rounded-3xl overflow-hidden text-center">
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--primary)] rounded-full opacity-20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[var(--primary-dark)] rounded-full opacity-20 blur-3xl" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="w-8 h-8 text-[var(--primary-dark)]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-light mb-4">Want to Join Our Mission?</h3>
              <p className="text-[var(--muted-foreground)] mb-8 max-w-xl mx-auto">
                We&apos;re always looking for passionate people who believe in doing things the right way.
                Check out our open positions or reach out to say hello.
              </p>
              <a
                href="mailto:careers@archiesremedies.com"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--foreground)] text-white rounded-full font-medium hover:bg-[var(--primary)] hover:text-[var(--foreground)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
