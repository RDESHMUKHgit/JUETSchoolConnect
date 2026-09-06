import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Button } from '../../components/ui/Button.js';
import { School, ArrowRight, ShieldAlert } from 'lucide-react';
import indiaData from '../../../indiaStatesCities.json';

interface StateCityData {
  state: string;
  iso2: string;
  cities: string[];
}

const stateList: StateCityData[] = indiaData as StateCityData[];

const stateOptions = stateList.map((item) => ({
  value: item.state,
  label: item.state,
}));

export const SchoolDetailsSetup: React.FC = () => {
  const navigate = useNavigate();
  const { submitSchoolDetails } = useAuth();

  const [name, setName] = useState('');
  const [board, setBoard] = useState<'CBSE' | 'ICSE'>('CBSE');
  const [state, setState] = useState('Uttar Pradesh');
  const [city, setCity] = useState('Noida');
  const [pin, setPin] = useState('');
  const [regNo, setRegNo] = useState('');
  const [schoolType, setSchoolType] = useState('PRIVATE');
  const [medium, setMedium] = useState<'ENGLISH' | 'HINDI'>('ENGLISH');
  const [officialPhone, setOfficialPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const currentCities = useMemo(() => {
    const found = stateList.find((s) => s.state.toLowerCase() === state.toLowerCase());
    return found ? found.cities : [];
  }, [state]);

  const cityOptions = useMemo(() => {
    return currentCities.map((c) => ({
      value: c,
      label: c,
    }));
  }, [currentCities]);

  const handleStateChange = (newState: string) => {
    setState(newState);
    const found = stateList.find((s) => s.state.toLowerCase() === newState.toLowerCase());
    if (found && found.cities.length > 0) {
      setCity(found.cities[0]);
    } else {
      setCity('');
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !state || !city) {
      setError('Please provide the school name, state, and city.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const nextStep = await submitSchoolDetails({
        name,
        board_affiliation: board,
        state,
        city,
        pin,
        registration_no: regNo,
        school_type: schoolType,
        medium_of_institution: medium,
        official_phone: officialPhone,
        website_url: websiteUrl,
      });
      navigate(nextStep);
    } catch (err: any) {
      setError(err.message || 'Failed to submit school details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <Card variant="glass" padding="lg" style={{ width: '100%', maxWidth: '680px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #E5B842 0%, #C59B27 100%)', color: '#0F172A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <School size={26} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            Complete School Institution Details
          </h2>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
            Step 3 of 3: Enter your institution profile for Platform Admin verification
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FEFCE8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #FEF08A', marginBottom: '20px' }}>
          <ShieldAlert size={18} style={{ color: '#9A751A', flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>
            Once submitted, your school will enter the Platform Admin verification queue. Upon approval, you will have access to student and teacher rosters.
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Official School Name"
            placeholder="e.g. Delhi Public School, Sector 30"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Board Affiliation"
              value={board}
              onChange={(e) => setBoard(e.target.value as any)}
              options={[
                { value: 'CBSE', label: 'CBSE (Central Board of Secondary Education)' },
                { value: 'ICSE', label: 'ICSE / ISC (Council for the Indian School Certificate)' },
              ]}
            />
            <Input
              label="Affiliation / Registration No."
              placeholder="e.g. 2130024"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '14px' }}>
            <Select
              label="State *"
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              options={stateOptions}
              placeholder="Select State"
              required
            />
            <Select
              label="City *"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              options={cityOptions}
              placeholder="Select City"
              required
            />
            <Input
              label="PIN Code"
              placeholder="201301"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="School Type"
              value={schoolType}
              onChange={(e) => setSchoolType(e.target.value)}
              options={[
                { value: 'PRIVATE', label: 'Private / Co-ed' },
                { value: 'GOVT.', label: 'Government / Kendriya Vidyalaya' },
                { value: 'GIRLS ONLY', label: 'Girls Only' },
                { value: 'BOYS ONLY', label: 'Boys Only' },
              ]}
            />
            <Select
              label="Medium of Instruction"
              value={medium}
              onChange={(e) => setMedium(e.target.value as any)}
              options={[
                { value: 'ENGLISH', label: 'English Medium' },
                { value: 'HINDI', label: 'Hindi Medium' },
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Official Landline / Phone"
              placeholder="0120-2456789"
              value={officialPhone}
              onChange={(e) => setOfficialPhone(e.target.value)}
            />
            <Input
              label="School Website URL"
              placeholder="https://www.dpsnoida.edu.in"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            loading={loading}
            icon={<ArrowRight size={18} />}
            style={{ width: '100%', marginTop: '10px' }}
          >
            Submit School for Verification
          </Button>
        </form>
      </Card>
    </div>
  );
};
