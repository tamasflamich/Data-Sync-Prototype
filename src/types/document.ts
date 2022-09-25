import * as Automerge from 'automerge';

export interface DocumentChange {
  createdAt: number;
  change: Automerge.BinaryChange | undefined;
}

export interface VersionedDocument {
  lastModifiedAt: number;
}
