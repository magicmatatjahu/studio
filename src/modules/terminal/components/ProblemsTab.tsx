import { useState } from 'react';

import { useListener } from '@/hooks';

import type { FunctionComponent } from 'react';
import type { ProblemsInstance } from '../services/problems-manager.service';

interface ProblemsTabProps {}

export const ProblemsTab: FunctionComponent<ProblemsTabProps> = () => {
  const [problems, setProblems] = useState<[string, ProblemsInstance][]>([]);

  useListener('studio:problems:update', ({ problems }: { problems: Map<string, ProblemsInstance> }) => {
    setProblems(Array.from(problems.entries()));
  });

  if (problems.length) {
    const length = problems.reduce((acc, current) => { 
      acc += current[1].problems.length; 
      return acc; 
    }, 0);

    if (length) {
      return (
        <div className='flex flex-row justify-between items-center'>
          <span>
            Problems
          </span>
          <span className='inline-block flex items-center justify-center bg-inherit hover:bg-gray-600 active:bg-gray-500 text-gray-300 rounded ml-2'>
            {length}
          </span>
        </div>
      );
    }
  }

  return (
    <div>Problems</div>
  );
};
