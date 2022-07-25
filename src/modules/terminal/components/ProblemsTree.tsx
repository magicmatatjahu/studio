import { useInject } from '@adi/react';
import { useState } from 'react';

import { ProblemsTreeItem } from './ProblemTreeItem';

import { MonacoService } from '../../monaco/services/monaco.service';
import { PanelsManager } from '../../core/services/panels-manager.service';
import { FileSystemHelpersServive } from '../../filesystem/services/filesystem-helpers.service';

import { useListener } from '@/hooks';

import type { FunctionComponent } from 'react';
import type { ProblemsInstance } from '../services/problems-manager.service';

interface ProblemsTreeProps {}

export const ProblemsTree: FunctionComponent<ProblemsTreeProps> = () => {
  const monacoService = useInject(MonacoService);
  const panelsManager = useInject(PanelsManager);
  const fileSystemHelpers = useInject(FileSystemHelpersServive);
  const [problems, setProblems] = useState<[string, ProblemsInstance][]>([]);

  useListener('studio:problems:update', ({ problems }: { problems: Map<string, ProblemsInstance> }) => {
    setProblems(Array.from(problems.entries()));
  });

  if (problems.length === 0) {
    return (
      <div className='text-gray-300 text-sm mt-1.5 px-4'>
        <span>
          No problems have beed detected in files.
        </span>
      </div>
    )
  }

  return (
    <div>
      <ul className='py-1'>
        {problems.map(([problemOwner, problemInstance]) => (
          <li key={problemOwner}>
            <ProblemsTreeItem {...problemInstance} monacoService={monacoService} panelsManager={panelsManager} fileSystemHelpers={fileSystemHelpers} />
          </li>
        ))}
      </ul>
    </div>
  )
};
