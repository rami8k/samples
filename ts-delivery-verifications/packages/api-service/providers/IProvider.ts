import { Message } from './Message'

export interface IProvider {
  ownerEmail?: string;
  mailClient: any;
  
  getNewMessages(item: {}): Promise<Message[]>;

  getMessage(id: String): object;

  deleteMessage(id: String): void;

  deleteMessages(ids: String[]): void;
  
  deleteAll(): void;

  markRead(ids: String[]): void;
}