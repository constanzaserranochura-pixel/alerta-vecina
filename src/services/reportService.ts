// src/services/reportService.ts

import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export const createReport = async (
  userId: string,
  nickname: string,
  reportData: any
) => {
  await addDoc(collection(db, "reports"), {
    ...reportData,
    authorNickname: nickname,    // "LoboNocturno42" ← visible para todos
    authorId: userId,            // ID interno ← nunca se muestra en pantalla
    createdAt: new Date()
  });
};