import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export class DataResponse<T> {
  data: T;

  constructor(data: T) {
    this.data = data;
  }
}

export const ApiDataResponse = (schema: SchemaObject | ReferenceObject) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(DataResponse) },
          { properties: { data: schema } },
        ],
      },
    }),
  );
};
