import React from 'react';
import { VscListSelection, VscCode, VscOpenPreview, VscTypeHierarchy, VscNewFile } from 'react-icons/vsc';

import { SettingsModal } from './Modals/Settings/SettingsModal';

import state from '../state';

type NavItemType = 'navigation' | 'editor' | 'template' | 'visualiser';

function setActiveNav(navItem: NavItemType) {
  const panels = state.sidebar.panels;
  const panelsState = panels.get();

  const newState = {
    ...panelsState,
  };

  if (navItem === 'template' || navItem === 'visualiser') {
    // on current type
    if (newState.viewType === navItem) {
      newState.view = !newState.view;
    } else {
      newState.viewType = navItem;
      if (newState.view === false) {
        newState.view = true;
      }
    }
  } else {
    (newState as any)[String(navItem)] = !(newState as any)[String(navItem)];
  }

  if (newState.navigation && !newState.editor && !newState.view) {
    panels.set({
      ...newState,
      view: true,
    });
    return;
  }
  if (!Object.values(newState).some(itemNav => itemNav === true)) {
    panels.set({
      ...newState,
      view: true,
    });
    return;
  }

  panels.set(newState);
}

interface NavItem {
  name: string;
  title: string;
  state: () => boolean;
  icon: React.ReactNode;
}

interface SidebarProps {}

export const Sidebar: React.FunctionComponent<SidebarProps> = () => {
  const sidebarState = state.useSidebarState();
  const sidebarMode = sidebarState.mode.get();

  if (sidebarState.show.get() === false) {
    return null;
  }

  const navigation: NavItem[] = [
    // navigation
    {
      name: 'navigation',
      title: 'Navigation',
      state: () => sidebarState.panels.navigation.get(),
      icon: <VscListSelection className="w-5 h-5" />,
    },
    // editor
    {
      name: 'editor',
      title: 'Editor',
      state: () => sidebarState.panels.editor.get(),
      icon: <VscCode className="w-5 h-5" />,
    },
    // template
    {
      name: 'template',
      title: 'Preview',
      state: () => sidebarState.panels.view.get() && sidebarState.panels.viewType.get() === 'template',
      icon: <VscOpenPreview className="w-5 h-5" />,
    },
    // visuliser
    {
      name: 'visualiser',
      title: 'Visualiser',
      state: () => sidebarState.panels.view.get() && sidebarState.panels.viewType.get() === 'visualiser',
      icon: <VscTypeHierarchy className="w-5 h-5" />,
    },
    // newFile
    {
      name: 'newFile',
      title: 'Templates',
      state: () => false,
      icon: <VscNewFile className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex flex-col bg-gray-800 shadow-lg border-r border-gray-700 justify-between">
      <div className="flex flex-col">
        {navigation.map(item => (
          <button
            key={item.name}
            title={(item.name.charAt(0).toUpperCase() + item.name.slice(1))}
            onClick={() => setActiveNav(item.name as NavItemType)}
            className={`flex flex-col justify-center text-sm border-l-2 ${
              item.state()
                ? 'text-white border-pink-500'
                : 'text-gray-500 hover:text-white border-gray-800'
            } focus:outline-none border-box p-4`}
            type="button"
          >
            <span className='mx-auto'>
              {item.icon}
            </span>
            {sidebarMode === 'expanded' && (
              <span className='mt-1 text-xs mx-auto'>
                {item.title}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex flex-col">
        <SettingsModal />
      </div>
    </div>
  );
};