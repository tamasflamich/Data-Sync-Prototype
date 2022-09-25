import * as Automerge from 'automerge';

import { DocumentRepository } from '../repository/document-repository';
import { OnlineUsersOfDocumentRepository } from '../repository/online-users-of-document-repository';
import { ChangeBroadcastGateway } from '../gateway/change-broadcast-gateway';
import { v4 as uuid } from 'uuid';

export class DocumentSyncUseCase {
  private documentRepository: DocumentRepository;
  private onlineUsersOfDocumentRepository: OnlineUsersOfDocumentRepository;
  private changeBroadcastGateway: ChangeBroadcastGateway;

  constructor(
    documentRepository: DocumentRepository,
    onlineUsersOfDocumentRepository: OnlineUsersOfDocumentRepository,
    changeBroadcastGateway: ChangeBroadcastGateway,
  ) {
    this.documentRepository = documentRepository;
    this.onlineUsersOfDocumentRepository = onlineUsersOfDocumentRepository;
    this.changeBroadcastGateway = changeBroadcastGateway;
  }

  createDocument(userId: string): string {
    const documentId = uuid();
    this.documentRepository.createDocument(documentId);
    this.onlineUsersOfDocumentRepository.addOnlineUserToDocument(documentId, userId);
    return documentId;
  }

  getDocument(documentId: string, userId: string): Automerge.BinaryDocument | undefined {
    const foundDocument = this.documentRepository.getDocument(documentId);
    if (foundDocument) {
      this.onlineUsersOfDocumentRepository.addOnlineUserToDocument(documentId, userId);
    }
    return foundDocument;
  }

  updateDocument(documentId: string, userId: string, change: Automerge.BinaryChange) {
    this.documentRepository.updateDocument(documentId, change);

    const onlineUsersUsingThisDocument = this.onlineUsersOfDocumentRepository.getOnlineUsers(documentId);

    if (onlineUsersUsingThisDocument) {
      const usersToNotify = [...onlineUsersUsingThisDocument].filter(onlineUserId => onlineUserId !== userId);
      this.changeBroadcastGateway.broadcastChangeToUsers(usersToNotify, change);
    }
  }

  getUpdatesSince(documentId: string, lastSyncTimestamp: number): Automerge.BinaryChange[] {
    return this.documentRepository.getUpdatesSince(documentId, lastSyncTimestamp);
  }
}
