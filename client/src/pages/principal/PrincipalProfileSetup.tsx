import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Button } from '../../components/ui/Button.js';
import { ImageUpload } from '../../components/ui/ImageUpload.js';
import { UserCheck, Phone, ShieldCheck, ArrowRight } from 'lucide-react';

export const PrincipalProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, completePrincipalProfile } = useAuth();

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(user?.profile_photo_url || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState('MALE');
  const [designation, setDesignation] = useState<'P' | 'VP'>('P');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const nextStep = await completePrincipalProfile({
        phone,
        gender,
        designation,
        profile_photo_url: profilePhotoUrl || undefined,
      });
      navigate(nextStep);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <Card variant="glass" padding="lg" style={{ width: '100%', maxWidth: '520px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEFCE8', border: '1px solid #FEF08A', color: '#9A751A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <UserCheck size={26} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            Principal Administrator Profile
          </h2>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
            Step 2 of 3: Provide your personal administrative details
          </p>
        </div>

        <div style={{ background: '#FEFCE8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #FEF08A', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>
            Logged in as: <strong style={{ color: '#0F172A' }}>{user?.fullName || user?.email}</strong>
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ImageUpload
            bucket="profile-images"
            value={profilePhotoUrl}
            onChange={setProfilePhotoUrl}
            label="Principal Profile Picture (Max 300 KB)"
          />

          <Input
            label="Official Phone / Mobile Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone size={18} />}
            required
          />

          <Select
            label="Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value as any)}
            options={[
              { value: 'P', label: 'P' },
              { value: 'VP', label: 'VP' },
            ]}
          />

          <Select
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />

          <Button
            type="submit"
            variant="gold"
            size="lg"
            loading={loading}
            icon={<ArrowRight size={18} />}
            style={{ width: '100%', marginTop: '10px' }}
          >
            Save & Proceed to School Details
          </Button>
        </form>
      </Card>
    </div>
  );
};
