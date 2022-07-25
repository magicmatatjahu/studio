import { useCallback, useState } from 'react';
import { VscChevronDown, VscChevronRight, VscError } from 'react-icons/vsc';

import type { FunctionComponent } from 'react';
import type { MonacoService } from '../../monaco/services/monaco.service';
import type { PanelsManager } from '../../core/services/panels-manager.service';
import type { FileSystemHelpersServive } from '../../filesystem/services/filesystem-helpers.service';
import type { ProblemsInstance, ProblemRecord, Range } from '../services/problems-manager.service';

function serializeRange(range: Range): string {
  let str = `${range.startLine}`;
  if (range.startColumn) str = `${str}:${range.startColumn}`;
  str = `${str}, ${range.endLine}`;
  if (range.endColumn) str = `${str}:${range.endColumn}`;
  return str;
}

interface ProblemsTreeItemProps extends ProblemsInstance {
  monacoService: MonacoService;
  panelsManager: PanelsManager;
  fileSystemHelpers: FileSystemHelpersServive;
}

export const ProblemsTreeItem: FunctionComponent<ProblemsTreeItemProps> = ({ resource, problems, monacoService, panelsManager, fileSystemHelpers }) => {
  const [expanded, setExpanded] = useState(true);

  const filename = fileSystemHelpers.filename(resource.path);
  const dirname = fileSystemHelpers.dirname(resource.path);

  const scrollToEditorLine = useCallback((problem: ProblemRecord) => {
    // TODO: Fix label inside panel inside tab metadata
    const tab = panelsManager.findTab(tab => `/${tab.data?.item?.label}` === resource.path);
    if (tab) panelsManager.setActiveTab(tab.id);
    monacoService.scrollToEditorLine(resource, problem.range.startLine, problem.range.startColumn);
  }, []); 

  return (
    <>
      <button type='button' className='flex-1 flex flex-row items-center overflow-hidden w-full text-gray-300 py-[1.5px] cursor-pointer pl-4 text-sm bg-gray-800 hover:bg-gray-700' onClick={() => setExpanded(state => !state)}>
        <div className="inline-block mr-1">
          {expanded ? <VscChevronDown /> : <VscChevronRight />}
        </div>

        <div className='flex flex-row items-center'>
          <span className='inline-block'>
            {filename}
          </span>
          {dirname ? (
            <span className='inline-block ml-2.5 text-xs text-gray-400'>
              {dirname}
            </span>
          ) : null}
          <span className='inline-block ml-2.5 text-xs'>
            {problems.length}
          </span>
        </div>
      </button>

      <ul className={`${expanded ? 'block' : 'hidden'}`}>
        {problems.map((problem, idx) => (
          <li 
            key={`${problem.message}${idx}`} 
            className='flex flex-row items-center pl-10 py-1 text-sm bg-gray-800 hover:bg-gray-700 cursor-pointer'
            onClick={() => scrollToEditorLine(problem)}
          >
            <div className='flex flex-row items-center'>
              <VscError className='text-red-500'/>
            </div>
            <div className='flex flex-row items-center ml-2 text-gray-300 text-xs'>
              <span className='inline-block'>{problem.message}</span>
              <span className='inline-block ml-2 text-gray-400'>{`[${serializeRange(problem.range)}]`}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};
