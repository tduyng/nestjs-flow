import { CreateSubscriberDto } from './dto/create-subscriber.dto';

export interface ISubscriber {
  id: string;
  email: string;
  name: string;
}

export interface ISubscriberService {
  addSubscriber(subscriber: CreateSubscriberDto): Promise<ISubscriber>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  getAllSubscribers(params: {}): Promise<ISubscriber>;
}
