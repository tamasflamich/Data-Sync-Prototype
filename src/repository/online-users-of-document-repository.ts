export class OnlineUsersOfDocumentRepository {
  private documentToUsersMapping: Record<string, Set<string>> = {};

  getOnlineUsers(documentId: string): Set<string> | undefined {
    return this.documentToUsersMapping[documentId];
  }

  addOnlineUserToDocument(documentId: string, userId: string) {
    const currentUsersOfDocument = this.documentToUsersMapping[documentId];

    if (currentUsersOfDocument) {
        currentUsersOfDocument.add(userId);
    } else {
        this.documentToUsersMapping[documentId] = new Set([userId]);
    }
  }

  removeUserFromOnlineUsers(documentId: string, userId: string) {
    this.documentToUsersMapping[documentId]?.delete(userId);
  }
}
