import { PaginationDto } from './pagination.dto';

export abstract class PaginatedResultDto<T> extends PaginationDto {
  totalCount: number;
  data: T[];
}
