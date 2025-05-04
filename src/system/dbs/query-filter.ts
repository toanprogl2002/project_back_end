import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import {
  FilterRequest,
  PaginateFilterRequest
} from './requests';

interface IQueryFilterOption {
  search?: string[];
  sort?: Record<string, 'ASC' | 'DESC'>;
}

interface ICursorFilterOption {
  search?: string[];
  sort?: Record<string, 'ASC' | 'DESC'>;
}

export class LengthAwarePaginator<T> {
  items: T[];

  total: number;

  size: number;

  page: number;

  last_page: number;

  constructor(items: T[], total: number, size: number, page: number) {
    this.items = items;
    this.total = total;
    this.size = size;
    this.page = page;
    this.last_page = Math.max(Math.ceil(total / size), 1);
  }
}

export class LengthAwareCursor<T> {
  items: T[];

  cursor: string;

  constructor(items: T[], cursor: string) {
    this.items = items;
    this.cursor = cursor;
  }
}

export function buildQueryFilter<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  request: FilterRequest,
  options?: IQueryFilterOption,
): SelectQueryBuilder<T> {
  if (request?.q?.trim()?.length && options?.search?.length) {
    const { search } = options;

    const keyword = request.q ?? '';

    query
      .andWhere(
        new Brackets((qb) => {
          search.forEach((key) => {
            qb.orWhere(`${key} LIKE :keyword`);
          });

          return qb;
        }),
      )
      .setParameter('keyword', `%${keyword}%`);
  }

  if (options?.sort) {
    const { sort } = options;

    Object.entries(sort).forEach(([key, value]) => {
      query.addOrderBy(key, value as 'ASC' | 'DESC');
    });
  }

  return query;
}

// export function buildCursorFilter<T extends ObjectLiteral>(
//   query: SelectQueryBuilder<T>,
//   request: FilterRequest,
//   options?: ICursorFilterOption,
// ): SelectQueryBuilder<T> {
//   if (request?.q?.trim()?.length && options?.search?.length) {
//     const { search } = options;

//     const keyword = request.q;

//     query
//       .andWhere(
//         new Brackets((qb) => {
//           search.forEach((key) => {
//             qb.orWhere(`${key} LIKE :keyword`);
//           });

//           return qb;
//         }),
//       )
//       .setParameter('keyword', `%${keyword}%`);
//   }

//   if (options?.sort) {
//     const { sort } = options;

//     Object.entries(sort).forEach(([key, value]) => {
//       query.addOrderBy(key, value as 'ASC' | 'DESC');
//     });
//   }

//   return query;
// }

export async function buildPaginateQuery<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  request: PaginateFilterRequest,
): Promise<LengthAwarePaginator<T>> {
  const total = await query.clone().getCount();

  let items: T[] = [];

  if (total > 0) {
    items = await query
      .skip((request.page - 1) * request.size)
      .take(request.size)
      .getMany();
  }

  return new LengthAwarePaginator(items, total, request.size, request.page);
}

// export async function buildCursorQuery<T extends ObjectLiteral>(
//   query: SelectQueryBuilder<T>,
//   request: CursorFilterRequest,
//   key_entity: string,
//   cursor_field: string,
// ) {
//   if (request.cursor) {
//     query.andWhere(`${key_entity}.${cursor_field} > :cursor`, {
//       cursor: request.cursor,
//     });
//   }

//   const items: T[] = await query.take(request.size + 1).getMany();
//   let cursor: string | null = null;

//   if (items.length > request.size) {
//     items.pop();
//     cursor = items[items.length - 1][cursor_field];
//   }

//   return new LengthAwareCursor(items, cursor);
// }

export async function buildPaginateQueryFilter<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  request: PaginateFilterRequest,
  options?: IQueryFilterOption,
): Promise<LengthAwarePaginator<T>> {
  buildQueryFilter(query, request, options);

  return await buildPaginateQuery(query, request);
}

export async function buildRawPaginate<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  request: PaginateFilterRequest,
): Promise<LengthAwarePaginator<T>> {
  const total = await query.clone().getCount();

  let items: T[] = [];

  if (total > 0) {
    items = await query
      .skip((request.page - 1) * request.size)
      .take(request.size)
      .getRawMany();
  }

  return new LengthAwarePaginator(items, total, request.size, request.page);
}

export async function buildRawPaginateQueryFilter<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  request: PaginateFilterRequest,
  options?: IQueryFilterOption,
): Promise<LengthAwarePaginator<T>> {
  buildQueryFilter(query, request, options);

  return await buildRawPaginate(query, request);
}

// export async function buildCursorQueryFilter<T extends ObjectLiteral>(
//   query: SelectQueryBuilder<T>,
//   request: CursorFilterRequest,
//   key_entity: string,
//   cursor_field: string,
//   options?: ICursorFilterOption,
// ): Promise<LengthAwareCursor<T>> {
//   buildCursorFilter(query, request, options);

//   return await buildCursorQuery(query, request, key_entity, cursor_field);
// }

export async function emptyDataResponse<T extends ObjectLiteral>(
  request: PaginateFilterRequest,
) {
  return new LengthAwarePaginator<T>([], 0, request.size, request.page);
}
