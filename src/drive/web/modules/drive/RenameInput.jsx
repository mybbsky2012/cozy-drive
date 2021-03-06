import React from 'react'
import { connect } from 'react-redux'

import { useClient } from 'cozy-client'
import Alerter from 'cozy-ui/transpiled/react/Alerter'

import FilenameInput from 'drive/web/modules/filelist/FilenameInput'
import { abortRenaming } from './rename'

// If we set the _rev then CozyClient tries to update. Else
// it tries to create
const updateFileNameQuery = async (client, file, newName) => {
  return client.save({
    ...file,
    name: newName,
    _rev: file._rev || file.meta.rev
  })
}

export const RenameInput = ({ onAbort, file, refreshFolderContent }) => {
  const client = useClient()
  return (
    <FilenameInput
      name={file.name}
      onSubmit={async newName => {
        try {
          await updateFileNameQuery(client, file, newName)
          if (refreshFolderContent) refreshFolderContent()
        } catch {
          Alerter.error('alert.file_name', { fileName: newName })
        } finally {
          onAbort()
        }
      }}
      onAbort={onAbort}
    />
  )
}

const mapDispatchToProps = dispatch => ({
  onAbort: () => dispatch(abortRenaming())
})

export default connect(
  null,
  mapDispatchToProps
)(RenameInput)
