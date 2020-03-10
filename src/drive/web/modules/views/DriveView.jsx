/* global __TARGET__ */
import React, { useCallback } from 'react'
import { useQuery, Q } from 'cozy-client'
import SharingProvider from 'cozy-sharing'

import Breadcrumb from 'drive/web/modules/navigation/Breadcrumb'
import SelectionBar from 'drive/web/modules/selection/SelectionBar'
import Dropzone from 'drive/web/modules/upload/Dropzone'
import Main from 'drive/web/modules/layout/Main'
import Topbar from 'drive/web/modules/layout/Topbar'
import Toolbar from 'drive/web/modules/drive/Toolbar.jsx'
import { ROOT_DIR_ID, TRASH_DIR_ID } from 'drive/constants/config'

import { FileListv2 } from 'drive/web/modules/filelist/FileList'
import { FileListBodyV2 } from 'drive/web/modules/filelist/FileListBody'
import AddFolder from 'drive/web/modules/filelist/AddFolder'
import FileListHeader, {
  MobileFileListHeader
} from 'drive/web/modules/filelist/FileListHeader'
import Oops from 'components/Error/Oops'
import { EmptyDrive } from 'components/Error/Empty'
import FileListRowsPlaceholder from 'drive/web/modules/filelist/FileListRowsPlaceholder'
import { isMobileApp } from 'cozy-device-helper'
import File from 'drive/web/modules/filelist/File'
import LoadMore from 'drive/web/modules/filelist/LoadMore'

const DriveView = ({ params, router }) => {
  const { folderId } = params
  const currentFolderId = folderId || ROOT_DIR_ID

  const folderQuery = {
    definition: () =>
      Q('io.cozy.files')
        .where({
          dir_id: currentFolderId,
          _id: { $ne: TRASH_DIR_ID }
        })
        .indexFields(['dir_id', 'type', 'name'])
        .sortBy([{ dir_id: 'asc' }, { type: 'asc' }, { name: 'asc' }]),
    options: {
      as: 'folder-' + new Date().toString() // pending https://github.com/cozy/cozy-client/pull/668 to use the folder id as suffix
    }
  }
  const { fetchStatus, data, hasMore, fetchMore } = useQuery(
    folderQuery.definition,
    folderQuery.options
  )

  const navigateToFolder = useCallback(folderId => {
    router.push(`/v2/${folderId}`)
  })

  const navigateToFile = useCallback(file => {
    console.log({ file })
  })

  return (
    <SharingProvider doctype="io.cozy.files" documentType="Files">
      <Main>
        <Topbar>
          {false && <Breadcrumb onFolderOpen={null} />}
          {false && (
            <Toolbar
              folderId={null}
              canUpload={true}
              canCreateFolder={true}
              disabled={false}
            />
          )}
        </Topbar>
        <Dropzone
          role="main"
          disabled={__TARGET__ === 'mobile'}
          displayedFolder={null}
        >
          {false && <SelectionBar actions={[]} />}
          <FileListv2>
            <MobileFileListHeader canSort={true} />
            <FileListHeader canSort={true} />
            <FileListBodyV2 selectionModeActive={false}>
              <AddFolder />
              {fetchStatus === 'loading' && <FileListRowsPlaceholder />}
              {fetchStatus === 'error' && <Oops />}
              {fetchStatus === 'loaded' &&
                data.length === 0 && <EmptyDrive canUpload={true} />}
              {fetchStatus === 'loaded' &&
                data.length > 0 && (
                  <div className={isMobileApp() ? 'u-ov-hidden' : ''}>
                    {data.map(file => (
                      <File
                        key={file._id}
                        attributes={file}
                        displayedFolder={null}
                        actions={{}}
                        isRenaming={false}
                        onFolderOpen={navigateToFolder}
                        onFileOpen={navigateToFile}
                        withSelectionCheckbox={true}
                        withFilePath={false}
                        withSharedBadge={true}
                        isFlatDomain={true}
                      />
                    ))}
                    {hasMore && (
                      <LoadMore onClick={fetchMore} isLoading={false} />
                    )}
                  </div>
                )}
            </FileListBodyV2>
          </FileListv2>
        </Dropzone>
      </Main>
    </SharingProvider>
  )
}

export default DriveView
