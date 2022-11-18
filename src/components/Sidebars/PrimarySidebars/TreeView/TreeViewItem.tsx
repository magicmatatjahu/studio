import React, { useState } from 'react';
import { VscChevronRight, VscChevronDown, VscJson, VscNewFile, VscNewFolder, VscTrash, VscEdit, VscRefresh, VscCollapseAll } from 'react-icons/vsc';

import { TreeView } from './TreeView';
import { IconButton } from '../../../common/IconButton';

import { BrowserAPIFileSystemService } from '../../../../services/file-system';

import type { File } from '../../../../services/file-system/abstract-file-system.service';

interface TreeViewItemActionsProps {
  file: File;
}

const TreeViewItemDirectoryActions: React.FunctionComponent<TreeViewItemActionsProps> = ({ file }) => {
  const actions = [
    <IconButton 
      onClick={(e) => {
        e.stopPropagation();
        BrowserAPIFileSystemService.createFile(file.uriString + '/lol3.json', '')
      }}
      icon={VscNewFile}
    />,
    <IconButton 
      onClick={(e) => {
        e.stopPropagation();
        BrowserAPIFileSystemService.createDirectory(file.uriString + '/dupa')
      }}
      icon={VscNewFolder}
    />,
    <IconButton 
      onClick={(e) => {
        e.stopPropagation();
        BrowserAPIFileSystemService.delete(file.uriString)
      }}
      icon={VscTrash}
    />,
  ];

  return (
    <ul className='flex flex-row items-center'>
      {actions.map((action, idx) => (
        <li className='flex flex-row items-center inline ml-1 text-sm' key={idx}>
          {action}
        </li>
      ))}
    </ul>
  );
}

const TreeViewItemFileActions: React.FunctionComponent<TreeViewItemActionsProps> = ({ file }) => {
  const actions = [
    <IconButton 
      onClick={(e) => {
        e.stopPropagation();
      }}
      icon={VscEdit}
    />,
    <IconButton 
      onClick={(e) => {
        e.stopPropagation();
        BrowserAPIFileSystemService.delete(file.uriString)
      }}
      icon={VscTrash}
    />,
  ];

  return (
    <ul className='flex flex-row items-center'>
      {actions.map((action, idx) => (
        <li className='flex flex-row items-center inline ml-1 text-sm' key={idx}>
          {action}
        </li>
      ))}
    </ul>
  );
}

interface TreeViewItemProps {
  file: File;
  deep: number;
}

export const TreeViewItem: React.FunctionComponent<TreeViewItemProps> = ({ file, deep }) => {
  const [expanded, setExpaned] = useState(false);
  const [hover, setHover] = useState(false);

  const { name, type, children } = file;
  const isDirectory = type === 'directory';

  return (
    <div>
      <div 
        className='group text-xs pl-4 pr-2 py-0.5 bg-gray-800 hover:bg-gray-700 cursor-pointer text-gray-300'
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className='flex flex-row items-center justify-between' onClick={() => setExpaned(expand => !expand)}>
          {deep ? Array.from(Array(deep).keys()).map((idx) => (
            <div className='flex-none border-l border-gray-600 ml-1.5 pl-1.5' key={idx} />
          )) : null}

          <div className='flex-1 flex flex-row items-center overflow-hidden'>
            {isDirectory ? (
              <button className='inline-block mr-1'>
                {expanded ? <VscChevronDown /> : <VscChevronRight />}
              </button>
            ) : (
              <div className='inline-block mr-1'>
                <VscJson />
              </div>
            )}

            <div className='overflow-hidden whitespace-nowrap text-ellipsis'>
              {name}
            </div>
          </div>

          <div className={`flex-none ${hover ? 'block' : 'hidden'}`}>
            {isDirectory ? (
              <TreeViewItemDirectoryActions file={file} />
            ) : (
              <TreeViewItemFileActions file={file} />
            )}
          </div>
        </div>
      </div>

      {isDirectory && (
        <div className={expanded ? 'block' : 'hidden'}>
          <TreeView files={children} deep={deep + 1} />
        </div>
      )}
    </div>
  );
};