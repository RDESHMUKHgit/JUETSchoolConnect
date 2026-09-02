import React from 'react';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Award, ExternalLink, MapPin } from 'lucide-react';

export const AboutJaypee: React.FC = () => {
  const campuses = [
    {
      name: 'Jaypee Institute of Information Technology (JIIT)',
      location: 'Noida, Sector 62 & 128, Uttar Pradesh',
      desc: 'Established in 2001, JIIT is a premier Deemed-to-be-University offering cutting-edge programs in Computer Science, IT, Electronics, Biotechnology, and Management. Consistently ranked amongst top institutions by NIRF.',
      link: 'https://www.jiit.ac.in',
    },
    {
      name: 'Jaypee University of Information Technology (JUIT)',
      location: 'Waknaghat, Solan, Himachal Pradesh',
      desc: 'Set amidst picturesque hills, JUIT is a center of academic excellence recognized for advanced research in Bioinformatics, Civil Engineering, and Computer Applications.',
      link: 'https://www.juit.ac.in',
    },
    {
      name: 'Jaypee University of Engineering and Technology (JUET)',
      location: 'Guna, Madhya Pradesh',
      desc: 'Sprawling lush green campus accredited Grade "A+" by NAAC, specializing in Mechanical, Chemical, Electronics, and Computer Science disciplines.',
      link: 'https://www.juet.ac.in',
    },
  ];

  return (
    <div style={{ padding: '60px 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Badge variant="gold" size="sm">ACADEMIC EXCELLENCE</Badge>
          <h1 style={{ fontSize: '38px', fontWeight: 800, marginTop: '12px', marginBottom: '16px', color: '#0F172A' }}>
            About Jaypee Higher Education System
          </h1>
          <p style={{ fontSize: '18px', color: '#475569', maxWidth: '720px', margin: '0 auto' }}>
            Two decades of pioneering technological leadership, world-class faculty, and state-of-the-art research infrastructure.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '48px' }}>
          {campuses.map((c) => (
            <Card key={c.name} variant="glass" padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>{c.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9A751A', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
                    <MapPin size={15} />
                    <span>{c.location}</span>
                  </div>
                </div>
                <a
                  href={c.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    color: '#0284C7',
                    fontWeight: 600,
                  }}
                >
                  Visit Official Website <ExternalLink size={14} />
                </a>
              </div>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7 }}>
                {c.desc}
              </p>
            </Card>
          ))}
        </div>

        <Card variant="gold" padding="lg" style={{ textAlign: 'center' }}>
          <Award size={36} style={{ color: '#9A751A', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
            Jaypee Merit Scholarship Slabs
          </h2>
          <p style={{ fontSize: '15px', color: '#475569', maxWidth: '640px', margin: '0 auto 20px', lineHeight: 1.7 }}>
            Jaypee School Connect test attempts are continuously monitored by our admissions faculty. High-performing students (80th percentile and above) earn special tuition waivers and direct counseling invitations.
          </p>
        </Card>
      </div>
    </div>
  );
};
