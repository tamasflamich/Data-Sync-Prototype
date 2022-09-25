import { BinaryChange, BinaryDocument } from 'automerge';

export const createBinaryChange = (text: string): BinaryChange => {
  return new Uint8Array(JSON.parse(text)) as BinaryChange;
};

export const createBinaryDocument = (text: string): BinaryDocument => {
  return new Uint8Array(JSON.parse(text)) as BinaryDocument;
};

export const createBinaryChangeFromNumberArray = (array: number[]): BinaryChange => {
  return new Uint8Array(array) as BinaryChange;
};
