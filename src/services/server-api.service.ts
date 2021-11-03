import fileDownload from 'js-file-download';

import state from '../state';

/**
 * A temporary service for the ServiceAPI that uses the AsyncAPI Playground server to generate the templates. 
 */ 
export class ServerAPIService {
  static serverPath = 'https://playground.asyncapi.io';

  static async generate(template: string) {
    const editorState = state.editor;

    return fetch(`${this.serverPath}/${template}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: editorState.editorValue.get(),
      }),
    })
      .then(response => response.blob())
      .then(zipFile => {
        fileDownload(zipFile, `asyncapi-${template}.zip`);
      });
  }

  static getTemplates() {
    return {
      'html': '@asyncapi/html-template',
      'markdown': '@asyncapi/markdown-template',
    };
  }
}
