// src/services/authService.ts

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { generateNickname } from "../utils/nicknameGenerator";
import { User } from "../types";

export const registerUser = async (email: string, password: string, neighborhood: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const userId = userCredential.user.uid;

  const nickname = generateNickname();

  const newUser: User = {
    nickname: nickname,
    trustScore: 0,
    reportsCount: 0,
    neighborhood: neighborhood,
    createdAt: new Date()
  };

  await setDoc(doc(db, "users", userId), newUser);

  return { userId, nickname };
};

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const getUserData = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  return null;
};