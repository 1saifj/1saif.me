import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../config/firebase'

export interface Contact {
  id?: string
  name: string
  email: string
  subject: string
  message: string
  urgency: 'low' | 'medium' | 'high'
  contactMethod: 'email' | 'phone' | 'video'
  createdAt: string | Timestamp
  status: 'new' | 'read' | 'responded' | 'archived'
}

const COLLECTION_NAME = 'contacts'

// Add a new contact
export const addContact = async (contact: Omit<Contact, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...contact,
      createdAt: Timestamp.now(),
      status: 'new'
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding contact:', error)
    throw error
  }
}

// Get all contacts
export const getAllContacts = async (): Promise<Contact[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    const contacts: Contact[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      contacts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : data.createdAt
      } as Contact)
    })
    
    return contacts
  } catch (error) {
    console.error('Error getting contacts:', error)
    throw error
  }
}

// Update contact status
export const updateContactStatus = async (contactId: string, status: Contact['status']): Promise<void> => {
  try {
    const contactRef = doc(db, COLLECTION_NAME, contactId)
    await updateDoc(contactRef, { status })
  } catch (error) {
    console.error('Error updating contact status:', error)
    throw error
  }
}

// Delete a contact
export const deleteContact = async (contactId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, contactId))
  } catch (error) {
    console.error('Error deleting contact:', error)
    throw error
  }
}
