import * as Automerge from 'automerge';

import { DocumentChange } from '../types/document';

export class DocumentRepository {
  private documentChanges: Record<string, DocumentChange[]> = {};

  createDocument(documentId: string) {
    if (this.documentChanges[documentId] !== undefined) {
      throw new DocumentRepositoryCreateFailedError(`Document with id ${documentId} already exists`);
    }

    this.documentChanges[documentId] = [{ createdAt: new Date().getTime(), change: undefined }];
  }

  getDocument(documentId: string): Automerge.BinaryDocument | undefined {
    const recreatedDocument = this.loadAutomergeRepresentation(documentId);
    if (recreatedDocument === undefined) {
      return undefined;
    }
    return Automerge.save(recreatedDocument);
  }

  updateDocument(documentId: string, change: Automerge.BinaryChange) {
    const timestamp = new Date().getTime();
    const recreatedDocument = this.loadAutomergeRepresentation(documentId);

    if (recreatedDocument === undefined) {
      throw new DocumentRepositoryUpdateFailedError('Document not found for update');
    }

    try {
      Automerge.applyChanges(recreatedDocument, [change]);
      this.documentChanges[documentId].push({ createdAt: timestamp, change });
    } catch (error) {
      throw new DocumentRepositoryUpdateFailedError((error as Error).message);
    }
  }

  getUpdatesSince(documentId: string, lastSyncTimestamp: number): Automerge.BinaryChange[] {
    const documentChanges = this.documentChanges[documentId];

    if (documentChanges === undefined) {
      throw new DocumentRepositoryUpdateFailedError('Document not found for update');
    }

    return documentChanges
      .filter(currentChange => currentChange.createdAt > lastSyncTimestamp && currentChange.change !== undefined)
      .map(changeWithTimestamp => changeWithTimestamp.change as Automerge.BinaryChange);
  }

  private loadAutomergeRepresentation(documentId: string): Automerge.Doc<Record<string, string>> | undefined {
    const savedChanges = this.documentChanges[documentId];
    if (savedChanges === undefined) {
      return undefined;
    }
    const [recreatedDoc] = Automerge.applyChanges(
      Automerge.init(),
      savedChanges
        .filter(changeWithTimestamp => changeWithTimestamp.change !== undefined)
        .map(changeWithTimestamp => changeWithTimestamp.change as Automerge.BinaryChange),
    );
    return recreatedDoc;
  }
}

export class DocumentRepositoryCreateFailedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class DocumentRepositoryUpdateFailedError extends Error {
  constructor(message: string) {
    super(message);
  }
}
