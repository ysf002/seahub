import React, {Suspense} from 'react';
import ReactDom from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './_i18n/i18n-sdoc-editor';
import Loading from './components/loading';
import {SimpleViewer} from "@seafile/sdoc-editor";

const { serviceURL, siteRoot, lang, mediaUrl } = window.app.config;
const { username, name } = window.app.userInfo;
const {
  repoID, docPath, docName, docUuid, seadocAccessToken, seadocServerUrl, assetsUrl
} = window.app.pageOptions;

window.seafile = {
  repoID,
  docPath,
  docName,
  docUuid,
  isOpenSocket: true,
  serviceUrl: serviceURL,
  accessToken: seadocAccessToken,
  sdocServer: seadocServerUrl,
  name,
  username,
  siteRoot,
  assetsUrl,
  lang,
  mediaUrl
};

ReactDom.render(
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<Loading/>}>
        <SimpleViewer showComment={true}/>
      </Suspense>
    </I18nextProvider>,
    document.getElementById('wrapper')
);
