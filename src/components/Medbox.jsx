import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  doc,
  deleteDoc
} from 'firebase/firestore';

export default function Medbox({ user }) {
  const [meds, setMeds] = useState([]);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'medications', user.uid, 'userMedications'),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const medsData = [];
        querySnapshot.forEach((doc) => {
          medsData.push({ ...doc.data(), id: doc.id });
        });
        setMeds(medsData);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleAddMed = async (e) => {
    e.preventDefault();
    if (medName.trim() === '' || medDosage.trim() === '') return;
    try {
      await addDoc(collection(db, 'medications', user.uid, 'userMedications'), {
        name: medName,
        dosage: medDosage,
        createdAt: new Date(),
      });
      setMedName('');
      setMedDosage('');
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleDeleteMed = async (id) => {
    try {
      await deleteDoc(doc(db, 'medications', user.uid, 'userMedications', id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">My MedBox</h1>
        <div className="flex items-center">
          <span className="text-gray-600 mr-4">{user.email}</span>
          <button
            onClick={() => signOut(auth)}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Medication</h2>
          <form onSubmit={handleAddMed} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="Medication Name (e.g., Paracetamol)"
              required
              className="flex-grow mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={medDosage}
              onChange={(e) => setMedDosage(e.target.value)}
              placeholder="Dosage (e.g., 500mg)"
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full sm:w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Medications</h2>
          <div className="space-y-4">
            {meds.length === 0 ? (
              <p className="text-gray-500">You haven't added any medications yet.</p>
            ) : (
              meds.map((med) => (
                <div key={med.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg text-gray-800">{med.name}</p>
                    <p className="text-gray-600">{med.dosage}</p>
                  </div>
                  <button onClick={() => handleDeleteMed(med.id)} className="text-red-500 hover:text-red-700 font-bold text-2xl">&times;</button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
