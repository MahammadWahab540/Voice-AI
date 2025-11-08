import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { storage } from '../lib/storage';

export const AuthScreen = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({ name: '', phone: '' });

  const validateForm = (): boolean => {
    const newErrors = { name: '', phone: '' };
    let isValid = true;

    if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      newErrors.phone = 'Phone number must be 10 digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const cleanPhone = phone.replace(/\D/g, '');
    storage.saveUser({ name: name.trim(), phone: cleanPhone });
    navigate('/call');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">NxtWave Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-navy">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? 'border-error' : ''}
              />
              {errors.name && <p className="text-sm text-error">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-navy">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-subtext">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`pl-14 ${errors.phone ? 'border-error' : ''}`}
                  maxLength={10}
                />
              </div>
              {errors.phone && <p className="text-sm text-error">{errors.phone}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg">
              Start Onboarding
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
