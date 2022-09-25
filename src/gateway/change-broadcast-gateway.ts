import * as Automerge from 'automerge';

import { UserRepository } from '../repository/user-repository';

export class ChangeBroadcastGateway {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  broadcastChangeToUsers(userIds: string[], change: Automerge.BinaryChange) {
    userIds.forEach(userId => {
      this.userRepository.getUser(userId)?.connection?.write(JSON.stringify(Array.from(change)));
    });
  }
}
