import { initializeApp } from "@firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "@firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
  limit,
  updateDoc,
  deleteDoc,
} from "@firebase/firestore";
import type { UserProfile, Space, ProgressReport } from "../types";

// === Konfigurasi Firebase ===
const firebaseConfig = {
  apiKey: "AIzaSyAU21BcQ1LMElQ8v0Pu4yQpBG-4WU8BK5c",
  authDomain: "noya-f435a.firebaseapp.com",
  projectId: "noya-f435a",
  storageBucket: "noya-f435a.appspot.com",
  messagingSenderId: "972657307551",
  appId: "1:972657307551:web:0ec361184161f363f697aa",
};

// === Inisialisasi App ===
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// === Utility: Buat profil user jika belum ada ===
const createProfileIfNotExists = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || "Noya User",
      email: user.email,
    });
  }
};

// === AUTH ===
export const signUp = async (name: string, email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
  });
  return user;
};

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await createProfileIfNotExists(result.user);
  return result.user;
};

export const signOutUser = () => signOut(auth);

// === USER PROFILE ===
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { uid, ...docSnap.data() } as UserProfile;
  return null;
};

// === SPACES ===
export const createSpace = (uid: string, name: string, description: string) => {
  const spacesColRef = collection(db, "users", uid, "spaces");
  return addDoc(spacesColRef, {
    name,
    description,
    createdAt: Timestamp.now(),
    pinned: false,
  });
};

export const getSpaces = (uid: string, callback: (spaces: Space[]) => void) => {
  const spacesColRef = collection(db, "users", uid, "spaces");
  const q = query(spacesColRef);

  return onSnapshot(q, async (querySnapshot) => {
    const spacesPromises = querySnapshot.docs.map(async (docSnapshot) => {
      const spaceData = docSnapshot.data();

      // Ambil progress terakhir & total progress
      const progressColRef = collection(db, "users", uid, "spaces", docSnapshot.id, "progress_reports");
      const progressQuery = query(progressColRef, orderBy("date", "desc"), limit(1));
      const progressSnapshot = await getDocs(progressQuery);

      const progressCount = (await getDocs(progressColRef)).size;
      const lastUpdated =
        progressSnapshot.docs.length > 0
          ? progressSnapshot.docs[0].data().date
          : spaceData.createdAt;

      return {
        id: docSnapshot.id,
        ...spaceData,
        progressCount,
        lastUpdated,
      } as Space;
    });

    const spaces = await Promise.all(spacesPromises);
    spaces.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt.seconds - a.createdAt.seconds;
    });

    callback(spaces);
  });
};

export const togglePinSpace = async (uid: string, spaceId: string, currentStatus: boolean) => {
  const spaceRef = doc(db, "users", uid, "spaces", spaceId);
  await updateDoc(spaceRef, { pinned: !currentStatus });
};

export const getSpaceDetails = async (uid: string, spaceId: string): Promise<Space | null> => {
  const docRef = doc(db, "users", uid, "spaces", spaceId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as Space;
  return null;
};

export const updateSpace = async (uid: string, spaceId: string, data: { name: string, description: string }) => {
    const spaceRef = doc(db, "users", uid, "spaces", spaceId);
    await updateDoc(spaceRef, data);
};

export const deleteSpace = async (uid: string, spaceId: string) => {
    const reportsColRef = collection(db, "users", uid, "spaces", spaceId, "progress_reports");
    const reportsSnapshot = await getDocs(reportsColRef);
    const deletePromises = reportsSnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(reportsColRef, docSnapshot.id))
    );
    await Promise.all(deletePromises);

    const spaceRef = doc(db, "users", uid, "spaces", spaceId);
    await deleteDoc(spaceRef);
};


// === PROGRESS REPORTS ===

// ➕ Tambah progress baru
export const addProgressReport = async (
  uid: string,
  spaceId: string,
  progress: string,
  nextStep: string,
  date: Timestamp
) => {
  const reportsColRef = collection(db, "users", uid, "spaces", spaceId, "progress_reports");
  return addDoc(reportsColRef, {
    date: date,
    progress,
    nextStep,
    markdownNote: "", // inisialisasi kosong
    lastModified: null,
  });
};

// ✏️ Update progress + maintain "Edited" status
export const updateProgressReport = async (
  uid: string,
  spaceId: string,
  reportId: string,
  data: { progress?: string; nextStep?: string; markdownNote?: string, date?: Timestamp }
) => {
  const reportRef = doc(db, "users", uid, "spaces", spaceId, "progress_reports", reportId);
  await updateDoc(reportRef, {
    ...data,
    lastModified: Timestamp.now(),
  });
};

// ❌ Hapus progress
export const deleteProgressReport = async (uid: string, spaceId: string, reportId: string) => {
  const reportRef = doc(db, "users", uid, "spaces", spaceId, "progress_reports", reportId);
  await deleteDoc(reportRef);
};

// 🧠 Stream realtime untuk progress (otomatis update UI)
export const getProgressReportsStream = (
  uid: string,
  spaceId: string,
  callback: (reports: ProgressReport[]) => void
) => {
  const reportsColRef = collection(db, "users", uid, "spaces", spaceId, "progress_reports");
  const q = query(reportsColRef, orderBy("date", "desc"));
  return onSnapshot(q, (querySnapshot) => {
    const reports = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ProgressReport)
    );
    callback(reports);
  });
};

// 🗒️ Update khusus catatan Markdown (untuk dialog 📝)
export const updateMarkdownNote = async (
  uid: string,
  spaceId: string,
  reportId: string,
  markdownNote: string
) => {
  const reportRef = doc(db, "users", uid, "spaces", spaceId, "progress_reports", reportId);
  await updateDoc(reportRef, {
    markdownNote,
    lastModified: Timestamp.now(),
  });
};