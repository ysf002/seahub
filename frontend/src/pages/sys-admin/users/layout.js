import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'reactstrap';
import { Router, useLocation, navigate } from '@gatsbyjs/reach-router';
import MainPanelTopbar from '../main-panel-topbar';
import { gettext, siteRoot } from '../../../utils/constants';
import UsersNav from './users-nav';
import Users from './users';
import Search from '../search';
import User from './user-info';
import AdminUsers from './admin-users';
import LDAPImportedUsers from './ldap-imported-users';
import LDAPUsers from './ldap-users';
import SearchUsers from './search-users';
import UserOwnedRepos from './user-repos';
import UserSharedRepos from './user-shared-repos';
import UserLinks from './user-links';
import UserGroups from './user-groups';
import UserNav from './user-nav';
import { eventBus } from '../../../components/common/event-bus';
import { EVENT_BUS_TYPE } from '../../../components/common/event-bus-type';

const USERS_PATH_KEYS = [
  'users',
  'ldap',
  'ldap-imported',
  'admins',
];

const UsersLayout = ({ ...commonProps }) => {
  const [hasUserSelected, setHasUserSelected] = useState(false);
  const [isImportUserDialogOpen, setIsImportUserDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isBatchSetQuotaDialogOpen, setIsBatchSetQuotaDialogOpen] = useState(false);
  const [isBatchDeleteUserDialogOpen, setIsBatchDeleteUserDialogOpen] = useState(false);
  const [isBatchAddAdminDialogOpen, setIsBatchAddAdminDialogOpen] = useState(false);

  const location = useLocation();
  const { curTab, isAdmin, isLDAPImported, isSingleUser } = useMemo(() => {
    const path = location.pathname.split('/').filter(Boolean).pop();
    let curTab = path;
    if (path === 'users') {
      curTab = 'database';
    } else if (path === 'admins') {
      curTab = 'admin';
    }
    const isAdmin = curTab === 'admin';
    const isLDAPImported = curTab === 'ldap-imported';
    const isSingleUser = !USERS_PATH_KEYS.includes(path);
    return { curTab, isAdmin, isLDAPImported, isSingleUser };
  }, [location.pathname]);

  const onHasUserSelected = (hasSelected) => {
    setHasUserSelected(hasSelected);
  };

  const toggleImportUserDialog = () => {
    setIsImportUserDialogOpen(!isImportUserDialogOpen);
  };

  const toggleAddUserDialog = () => {
    setIsAddUserDialogOpen(!isAddUserDialogOpen);
  };

  const toggleBatchSetQuotaDialog = () => {
    setIsBatchSetQuotaDialogOpen(!isBatchSetQuotaDialogOpen);
  };

  const toggleBatchDeleteUserDialog = () => {
    setIsBatchDeleteUserDialogOpen(!isBatchDeleteUserDialogOpen);
  };

  const toggleBatchAddAdminDialog = () => {
    setIsBatchAddAdminDialogOpen(!isBatchAddAdminDialogOpen);
  };

  const getOperationsForAll = () => {
    if (isAdmin) {
      return <Button className="btn btn-secondary operation-item" onClick={toggleBatchAddAdminDialog}>{gettext('Add Admin')}</Button>;
    }

    if (isLDAPImported) {
      return <a className="btn btn-secondary operation-item" href={`${siteRoot}sys/useradmin/export-excel/`}>{gettext('Export Excel')}</a>;
    }

    // 'database'
    return (
      <>
        <Button className="btn btn-secondary operation-item" onClick={toggleImportUserDialog}>{gettext('Import Users')}</Button>
        <Button className="btn btn-secondary operation-item" onClick={toggleAddUserDialog}>{gettext('Add User')}</Button>
        <a className="btn btn-secondary operation-item" href={`${siteRoot}sys/useradmin/export-excel/`}>{gettext('Export Excel')}</a>
      </>
    );
  };

  const getSearch = () => {
    if (isAdmin) {
      return null;
    }
    // offer 'Search' for 'DB' & 'LDAPImported' users
    return <Search
      placeholder={gettext('Search users')}
      submit={(keyword) => navigate(`${siteRoot}sys/search-users/?query=${encodeURIComponent(keyword)}`)}
    />;
  };

  const usersProps = {
    curTab,
    isAdmin,
    isLDAPImported,
    isAddUserDialogOpen,
    isImportUserDialogOpen,
    isBatchAddAdminDialogOpen,
    isBatchDeleteUserDialogOpen,
    isBatchSetQuotaDialogOpen,
    onHasUserSelected,
    toggleAddUserDialog,
    toggleImportUserDialog,
    toggleBatchAddAdminDialog,
    toggleBatchDeleteUserDialog,
    toggleBatchSetQuotaDialog
  };

  return (
    <>
      <MainPanelTopbar search={getSearch()} {...commonProps}>
        {hasUserSelected ?
          <>
            <Button className="btn btn-secondary operation-item" onClick={toggleBatchSetQuotaDialog}>{gettext('Set Quota')}</Button>
            <Button className="btn btn-secondary operation-item" onClick={toggleBatchDeleteUserDialog}>{gettext('Delete Users')}</Button>
          </>
          : getOperationsForAll()
        }
      </MainPanelTopbar>
      <UsersNav currentItem={curTab} />
      <Router primary={false}>
        <Users default {...commonProps} {...usersProps} />
        <AdminUsers path="admins" {...commonProps} {...usersProps} />
        <LDAPImportedUsers path="ldap-imported" {...commonProps} {...usersProps} />
        <LDAPUsers path="ldap" {...commonProps} {...usersProps} />
        {/* <User path=":email/*" {...commonProps}>
          <UserOwnedRepos path="owned-libraries" {...commonProps} />
          <UserSharedRepos path="shared-libraries" {...commonProps} />
          <UserLinks path="shared-links" {...commonProps} />
          <UserGroups path="groups" {...commonProps} />
        </User> */}
      </Router>
    </>
  );
};

const UserLayout = ({ email, children, ...commonProps }) => {
  const [username, setUsername] = useState('');
  const location = useLocation();
  const path = location.pathname.split('/').filter(Boolean).pop();
  let curTab = 'info';
  if (path === 'owned-libraries') {
    curTab = 'owned-repos';
  } else if (path === 'shared-libraries') {
    curTab = 'shared-repos';
  } else if (path === 'shared-links') {
    curTab = 'links';
  } else if (path === 'groups') {
    curTab = 'groups';
  }

  useEffect(() => {
    const unsubscribeUsername = eventBus.subscribe(EVENT_BUS_TYPE.SYNC_USERNAME, (username) => {
      setUsername(username);
    });

    return () => {
      unsubscribeUsername();
    };
  }, []);

  return (
    <>
      <MainPanelTopbar {...commonProps} />
      <UserNav currentItem={curTab} email={email} userName={username} />
      {children}
    </>
  );
};

export { UsersLayout, UserLayout };
