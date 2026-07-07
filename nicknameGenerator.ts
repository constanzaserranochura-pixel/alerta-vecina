// src/utils/nicknameGenerator.ts

const adjectives = [
  "Lobo", "Aguila", "Tigre", "Zorro", "Puma",
  "Cóndor", "Halcón", "Jaguar", "Lince", "Búho",
  "Panter", "Delfín", "Cuervo", "Bisonte", "Alce"
];

const nouns = [
  "Nocturno", "Veloz", "Sereno", "Alerta", "Guardián",
  "Vigía", "Centinela", "Protector", "Seguro", "Atento",
  "Cauteloso", "Discreto", "Prudente", "Silente", "Furtivo"
];

export const generateNickname = (): string => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 99) + 1;
  
  return `${adj}${noun}${number}`;
};