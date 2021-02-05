import { PaginatedResultDto } from '@common/global-dto/paginatedResult.dto';
import { User } from '../user.entity';

export class PaginatedUsersDto extends PaginatedResultDto<User> {}
