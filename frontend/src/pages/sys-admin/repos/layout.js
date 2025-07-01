import { Router, useLocation, navigate } from '@gatsbyjs/reach-router';
import React, { useCallback, useState } from 'react';
import AllRepos from './all-repos';
import AllWikis from './all-wikis';
import SystemRepo from './system-repo';
import TrashRepos from './trash-repos';
import MainPanelTopbar from '../main-panel-topbar';
import { Button } from 'reactstrap';
import { gettext, siteRoot } from '../../../utils/constants';
import ReposNav from './repos-nav';
import Search from '../search';
import toaster from '../../../components/toast';

const PATH_NAME_MAP = {
  'all-libraries': 'all',
  'all-wikis': 'wikis',
  'system-library': 'system',
  'trash-libraries': 'trash'
};

const LibrariesLayout = ({ ...commonProps }) => {
  const [isCreateRepoDialogOpen, setIsCreateRepoDialogOpen] = useState(false);

  const location = useLocation();
  const path = location.pathname.split('/').filter(Boolean).pop();
  const pathSegment = PATH_NAME_MAP[path] || 'all';

  const searchRepos = (repoNameOrID) => {
    if (this.getValueLength(repoNameOrID) < 3) {
      toaster.notify(gettext('Required at least three letters.'));
      return;
    }
    navigate(`${siteRoot}sys/search-libraries/?name_or_id=${encodeURIComponent(repoNameOrID)}`);
  };

  const getSearch = useCallback(() => {
    return (
      <Search
        placeholder={gettext('Search libraries by name or ID')}
        submit={searchRepos}
      />
    );
  }, []);

  const toggleCreateRepoDialog = useCallback(() => {
    setIsCreateRepoDialogOpen(!isCreateRepoDialogOpen);
  }, [isCreateRepoDialogOpen]);

  return (
    <>
      {pathSegment === 'all' ? (
        <MainPanelTopbar search={getSearch()} { ...commonProps }>
          <Button className="btn btn-secondary operation-item" onClick={toggleCreateRepoDialog}>
            <i className="sf3-font sf3-font-enlarge text-secondary mr-1"></i>{gettext('New Library')}
          </Button>
        </MainPanelTopbar>
      ) : (
        <MainPanelTopbar { ...commonProps } />
      )}

      <ReposNav key="libraries" currentItem={pathSegment} />
      <Router>
        <AllRepos
          path="all-libraries"
          isCreateRepoDialogOpen={isCreateRepoDialogOpen}
        />
        <AllWikis path="all-wikis" />
        <SystemRepo path="system-library" />
        <TrashRepos path="trash-libraries" />
      </Router>
    </>
  );
};

export default LibrariesLayout;
