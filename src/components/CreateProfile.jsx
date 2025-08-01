import { useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

// Styled Components
const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const FormContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 28rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  text-align: center;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  color: white;
  background-color: #2563eb;
  &:hover {
    background-color: #1d4ed8;
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 0.875rem;
`;

// The component now accepts the onProfileCreated prop
export default function CreateProfile({ user, onProfileCreated }) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }

    try {
      // --- CRITICAL SECURITY NOTE ---
      // In a real production app, you should NEVER handle a PIN on the client-side.
      // This PIN should be sent to a secure Cloud Function to be hashed with a library like bcrypt.
      // For this educational step, we are simulating it.
      const pinHash = `hashed_${pin}_${Math.random()}`; // DO NOT USE IN PRODUCTION
      const medboxId = `MB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Create the user role document
      await setDoc(doc(db, 'users', user.uid), {
        role: 'patient',
        name: name,
        medboxId: medboxId
      });

      // Create the patient profile document
      await setDoc(doc(db, 'patients', user.uid), {
        profile: {
            name: name,
            medboxId: medboxId,
            pinHash: pinHash,
            insurerId: null
        }
      });

      // After successfully creating the documents, call the function
      // passed down from App.jsx to trigger the navigation.
      if (onProfileCreated) {
        onProfileCreated();
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <Title>Create Your Profile</Title>
        <p className="text-center text-gray-600 mb-4">Final step! Set up your name and a secure PIN to complete your MedBox registration.</p>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Full Name"
          />
          <Input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            placeholder="4-Digit Secure PIN"
            maxLength="4"
          />
          <Input
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            required
            placeholder="Confirm PIN"
            maxLength="4"
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button type="submit">Complete Registration</Button>
        </Form>
      </FormContainer>
    </PageContainer>
  );
}
