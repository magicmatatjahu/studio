import create from 'zustand';
import { persist } from 'zustand/middleware';

const schema =
  localStorage.getItem('document') || `asyncapi: '2.5.0'
info:
  title: Streetlights Kafka API
  version: '1.0.0'
  description: |
    The Smartylighting Streetlights API allows you to remotely manage the city lights.
    ### Check out its awesome features:
    * Turn a specific streetlight on/off 🌃
    * Dim a specific streetlight 😎
    * Receive real-time information about environmental lighting conditions 📈
  license:
    name: Apache 2.0
    url: https://www.apache.org/licenses/LICENSE-2.0
servers:
  test:
    url: test.mykafkacluster.org:8092
    protocol: kafka-secure
    description: Test broker
    security:
      - saslScram: []
defaultContentType: application/json
channels:
  smartylighting.streetlights.1.0.event.{streetlightId}.lighting.measured:
    description: The topic on which measured values may be produced and consumed.
    parameters:
      streetlightId:
        $ref: '#/components/parameters/streetlightId'
    publish:
      summary: Inform about environmental lighting conditions of a particular streetlight.
      operationId: receiveLightMeasurement
      traits:
        - $ref: '#/components/operationTraits/kafka'
      message:
        $ref: '#/components/messages/lightMeasured'
  smartylighting.streetlights.1.0.action.{streetlightId}.turn.on:
    parameters:
      streetlightId:
        $ref: '#/components/parameters/streetlightId'
    subscribe:
      operationId: turnOn
      traits:
        - $ref: '#/components/operationTraits/kafka'
      message:
        $ref: '#/components/messages/turnOnOff'
  smartylighting.streetlights.1.0.action.{streetlightId}.turn.off:
    parameters:
      streetlightId:
        $ref: '#/components/parameters/streetlightId'
    subscribe:
      operationId: turnOff
      traits:
        - $ref: '#/components/operationTraits/kafka'
      message:
        $ref: '#/components/messages/turnOnOff'
  smartylighting.streetlights.1.0.action.{streetlightId}.dim:
    parameters:
      streetlightId:
        $ref: '#/components/parameters/streetlightId'
    subscribe:
      operationId: dimLight
      traits:
        - $ref: '#/components/operationTraits/kafka'
      message:
        $ref: '#/components/messages/dimLight'
components:
  messages:
    lightMeasured:
      name: lightMeasured
      title: Light measured
      summary: Inform about environmental lighting conditions of a particular streetlight.
      contentType: application/json
      traits:
        - $ref: '#/components/messageTraits/commonHeaders'
      payload:
        $ref: "#/components/schemas/lightMeasuredPayload"
    turnOnOff:
      name: turnOnOff
      title: Turn on/off
      summary: Command a particular streetlight to turn the lights on or off.
      traits:
        - $ref: '#/components/messageTraits/commonHeaders'
      payload:
        $ref: "#/components/schemas/turnOnOffPayload"
    dimLight:
      name: dimLight
      title: Dim light
      summary: Command a particular streetlight to dim the lights.
      traits:
        - $ref: '#/components/messageTraits/commonHeaders'
      payload:
        $ref: "#/components/schemas/dimLightPayload"
  schemas:
    lightMeasuredPayload:
      type: object
      properties:
        lumens:
          type: integer
          minimum: 0
          description: Light intensity measured in lumens.
        sentAt:
          $ref: "#/components/schemas/sentAt"
    turnOnOffPayload:
      type: object
      properties:
        command:
          type: string
          enum:
            - on
            - off
          description: Whether to turn on or off the light.
        sentAt:
          $ref: "#/components/schemas/sentAt"
    dimLightPayload:
      type: object
      properties:
        percentage:
          type: integer
          description: Percentage to which the light should be dimmed to.
          minimum: 0
          maximum: 100
        sentAt:
          $ref: "#/components/schemas/sentAt"
    sentAt:
      type: string
      format: date-time
      description: Date and time when the message was sent.
  securitySchemes:
    saslScram:
      type: scramSha256
      description: Provide your username and password for SASL/SCRAM authentication
  parameters:
    streetlightId:
      description: The ID of the streetlight.
      schema:
        type: string
  messageTraits:
    commonHeaders:
      headers:
        type: object
        properties:
          my-app-header:
            type: integer
            minimum: 0
            maximum: 100
  operationTraits:
    kafka:
      bindings:
        kafka:
          clientId: my-app-id
`;

export interface FileStat {
  mtime: number;
}

export type Directory = {
  type: 'directory';
  uri: string;
  name: string;
  children: Array<Directory | File>;
  from: 'storage';
  stat?: FileStat;
  parent?: Directory;
}

export type File = {
  type: 'file';
  uri: string;
  name: string;
  content: string;
  language: 'json' | 'yaml';
  modified: boolean;
  from: 'storage' | 'url' | 'base64';
  source?: string;
  stat?: FileStat;
  parent?: Directory;
}

export type FilesState = {
  files: Record<string, File>;
  directories: Record<string, Directory>;
}

export type FilesActions = {
  updateFile: (uri: string, file: Partial<File>) => void;
  removeFile: (uri: string) => void;
  updateDirectory: (uri: string, directory: Partial<Directory>) => void;
  removeDirectory: (uri: string) => void;
}

const defaultFiles: Record<string, File> = {
  asyncapi: {
    type: 'file',
    uri: 'asyncapi',
    name: 'asyncapi',
    content: schema,
    language: schema.trimStart()[0] === '{' ? 'json' : 'yaml',
    modified: false,
    from: 'storage',
    source: undefined,
    parent: undefined,
    stat: {
      mtime: (new Date()).getTime(),
    }
  }
};

export const filesState = create(
  persist<FilesState & FilesActions>(set => 
    ({
      files: defaultFiles,
      directories: {},
      updateFile(uri: string, file: Partial<File>) {
        set(state => ({ files: { ...state.files, [String(uri)]: { ...state.files[String(uri)] || {}, ...file } } }));
      },
      removeFile(uri: string) {
        set(state => {
          const files = { ...state.files };
          const file = files[String(uri)];
          if (!file) {
            return state;
          }

          delete files[String(uri)];
          const parent = file.parent;
          if (!parent) {
            return { files };
          }

          const directories = { ...state.directories };
          directories[String(parent.uri)] = { 
            ...parent, 
            children: parent.children.filter(c => !(c.uri === uri && c.type === 'file')),
          }; 
          return { files, directories };
        });
      },
      updateDirectory(uri: string, directory: Partial<Directory>) {
        set(state => ({ directories: { ...state.directories, [String(uri)]: { ...state.directories[String(uri)] || {}, ...directory } } }));
      },
      removeDirectory(uri: string) {
        set(state => {
          const directories = { ...state.directories };
          const directory = directories[String(uri)];
          if (!directory) {
            return state;
          }

          delete directories[String(uri)];
          if (directory.children.length === 0) {
            return { directories };
          }
          
          const files = { ...state.files };
          directory.children.forEach(c => {

          });
          return { directories, files };
        });
      },
    }), 
    {
      name: 'studio-files',
      getStorage: () => localStorage,
    }
  ),
);

export const useFilesState = filesState;