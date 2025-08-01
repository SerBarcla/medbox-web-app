import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { FileText, User, LogOut, Calendar, Stethoscope } from 'lucide-react';

// Styled Components
const PageContainer = styled.div`
  max-width: 64rem; /* 5xl */
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
`;

const AppTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: bold;
  color: #2563eb;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserEmail = styled.span`
  color: #4b5563;
  font-weight: 500;
  display: none;
  @media (min-width: 640px) {
    display: block;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  color: white;
  background-color: #dc2626;
  transition: background-color 0.2s;
  &:hover {
    background-color: #b91c1c;
  }
`;

const Card = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProfileDetail = styled.p`
    font-size: 1rem;
    color: #374151;
    margin-bottom: 0.5rem;
    strong {
        font-weight: 600;
        color: #111827;
    }
`;

const ConsultationItem = styled(Card)`
    margin-bottom: 1rem;
    border-left: 4px solid #3b82f6;
`;

const ConsultationHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    color: #4b5563;
    font-size: 0.875rem;
`;

const ConsultationNotes = styled.p`
    color: #374151;
    line-height: 1.6;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    border: 2px dashed #d1d5db;
`;

export default function PatientPortal({ user, profile }) {
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'patients', user.uid, 'consultations'),
        orderBy('date', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setConsultations(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      });
      return unsubscribe;
    }
  }, [user]);

  return (
    <PageContainer>
      <Header>
        <AppTitle>MedBox</AppTitle>
        <UserInfo>
          <UserEmail>{user.email}</UserEmail>
          <LogoutButton onClick={() => signOut(auth)}>
            <LogOut size={18} />
            Logout
          </LogoutButton>
        </UserInfo>
      </Header>

      <main>
         <Card>
            <CardTitle><User size={22}/> Your Profile</CardTitle>
            <ProfileDetail><strong>Name:</strong> {profile?.name || 'N/A'}</ProfileDetail>
            <ProfileDetail><strong>MedBox ID:</strong> {profile?.medboxId || 'N/A'}</ProfileDetail>
         </Card>

        <div>
          <CardTitle><FileText size={22}/> Consultation History</CardTitle>
          {consultations.length === 0 ? (
            <EmptyState>
                <p className="font-semibold text-lg text-gray-700">No records found</p>
                <p className="text-gray-500 mt-1">Your consultation history will appear here.</p>
            </EmptyState>
          ) : (
            consultations.map((consult) => (
              <ConsultationItem key={consult.id}>
                <ConsultationHeader>
                    <span className="flex items-center gap-2"><Calendar size={16}/> {new Date(consult.date.seconds * 1000).toLocaleDateString()}</span>
                    <span className="flex items-center gap-2"><Stethoscope size={16}/> Dr. {consult.doctorName || 'Unknown'}</span>
                </ConsultationHeader>
                <ConsultationNotes>{consult.typedNotes}</ConsultationNotes>
              </ConsultationItem>
            ))
          )}
        </div>
      </main>
    </PageContainer>
  );
}
