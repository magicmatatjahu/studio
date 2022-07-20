import { Injectable, SingletonScope } from "@adi/core";

import { convert, ConvertVersion } from '@asyncapi/converter';
import { parse, registerSchemaParser, AsyncAPIDocument } from '@asyncapi/parser';

import YAML from 'js-yaml';

// @ts-ignore
import openapiSchemaParser from '@asyncapi/openapi-schema-parser';
// @ts-ignore
import avroSchemaParser from '@asyncapi/avro-schema-parser';

import spec_2_0_0 from '@asyncapi/specs/schemas/2.0.0.json';
import spec_2_1_0 from '@asyncapi/specs/schemas/2.1.0.json';
import spec_2_2_0 from '@asyncapi/specs/schemas/2.2.0.json';
import spec_2_3_0 from '@asyncapi/specs/schemas/2.3.0.json';
import spec_2_4_0 from '@asyncapi/specs/schemas/2.4.0.json';

import type { OnInit } from '@adi/core';
import type { ParserOptions } from '@asyncapi/parser';

const specs = {
  '2.0.0': spec_2_0_0,
  '2.1.0': spec_2_1_0,
  '2.2.0': spec_2_2_0,
  '2.3.0': spec_2_3_0,
  '2.4.0': spec_2_4_0,
};

@Injectable({
  scope: SingletonScope,
})
export class AsyncAPIService implements OnInit {
  onInit(): void | Promise<void> {
    registerSchemaParser(openapiSchemaParser);
    registerSchemaParser(avroSchemaParser);
  }

  getSpecificationJSONSchemas() {
    return specs;
  }

  getSpecificationJSONSchema(version: string): any | undefined {
    return (specs as any)[version];
  }

  getLastSpecificationVersion(): string {
    return Object.keys(specs).pop() as string;
  }

  parse(asyncapi: string, options?: ParserOptions): Promise<AsyncAPIDocument> {
    return parse(asyncapi, options);
  }

  async convert(asyncapi: string, version?: string): Promise<string> {
    version = version || this.getLastSpecificationVersion();
    try {
      const converted = convert(asyncapi, version as ConvertVersion);
      if (typeof converted === 'object') {
        return JSON.stringify(converted, undefined, 2);
      }
      return converted;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  isSupportedAsyncAPI(version: string): boolean {
    return Object.keys(specs).includes(version);
  }

  isNotSupportedAsyncAPI(value: string | any): boolean {
    return !this.isSupportedAsyncAPI(value);
  }

  tryRetrieveAsyncAPIVersion(value: string | any): string | undefined {
    try {
      if (typeof value !== 'string') {
        return value.asyncapi;
      }
      const maybeSpec = YAML.load(value) as { asyncapi: string };
      return maybeSpec.asyncapi;
    } catch(e: any) {
      return;
    }
  }
}
