import React from 'react'
import { useQuery } from 'cozy-client'
import { buildDriveQuery } from 'drive/web/modules/queries'
import { useFolderSort } from 'drive/web/modules/navigation/duck'
import { useRouter } from 'drive/lib/RouterContext'

import {
  getCurrentFolderId,
  getCurrentFileId
} from 'drive/web/modules/selectors'
import { connect } from 'react-redux'
import FilesViewer, {
  FilesViewerLoading
} from 'drive/web/modules/viewer/FilesViewer'
import { getFolderPath } from 'drive/web/modules/routeUtils'

const FilesViewerWithQuery = props => {
  const { router } = useRouter()
  const [sortOrder] = useFolderSort()

  const buildedFilesQuery = buildDriveQuery({
    currentFolderId: props.folderId,
    type: 'file',
    sortAttribute: sortOrder.attribute,
    sortOrder: sortOrder.order
  })
  const filesQuery = useQuery(
    buildedFilesQuery.definition,
    buildedFilesQuery.options
  )

  if (filesQuery.data) {
    const viewableFiles = filesQuery.data
    return (
      <FilesViewer
        {...props}
        files={viewableFiles}
        filesQuery={filesQuery}
        onClose={() =>
          router.push({
            pathname: getFolderPath(props.folderId)
          })
        }
        onChange={fileId =>
          router.push({
            pathname: getFolderPath(props.folderId) + '/file/' + fileId
          })
        }
      />
    )
  } else {
    return <FilesViewerLoading />
  }
}

const mapStateToProps = state => ({
  folderId: getCurrentFolderId(state),
  fileId: getCurrentFileId(state)
})

export default connect(mapStateToProps)(FilesViewerWithQuery)
