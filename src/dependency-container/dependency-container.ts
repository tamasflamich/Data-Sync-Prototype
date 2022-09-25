import { UserRepository } from '../repository/user-repository';
import { DocumentSyncUseCase } from '../usecase/document-sync-usecase';
import { DocumentRepository } from '../repository/document-repository';
import { OnlineUsersOfDocumentRepository } from '../repository/online-users-of-document-repository';
import { ChangeBroadcastGateway } from '../gateway/change-broadcast-gateway';

interface DependencyContainer {
  userRepository: UserRepository;
  documentSyncUseCase: DocumentSyncUseCase;
}

export const resolveDependencyContainer = (): DependencyContainer => {
  const userRepository = new UserRepository();
  const documentRepository = new DocumentRepository();
  const onlineUsersOfDocumentRepository = new OnlineUsersOfDocumentRepository();
  const changeBroadcastGateway = new ChangeBroadcastGateway(userRepository);
  const documentSyncUseCase = new DocumentSyncUseCase(
    documentRepository,
    onlineUsersOfDocumentRepository,
    changeBroadcastGateway,
  );
  return {
    userRepository,
    documentSyncUseCase,
  };
};
