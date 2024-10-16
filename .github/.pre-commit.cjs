const fs = require('fs')

exports.preCommit = (props) => {
  const replaceVersion = (path, newVersion) => {
    let content = fs.readFileSync(path, 'utf-8')
    const versionRegex = /"version":\s*"(\d+\.\d+\.\d+)"/

    if (content.match(versionRegex)) {
      const updatedContent = content.replace(versionRegex, `"version": "${newVersion}"`)
      fs.writeFileSync(path, updatedContent)
      console.log(`"${path}" version updated to ${newVersion}`)
    } else {
      console.log(`Version not found in "${path}"`)
    }
  }

  replaceVersion('./tauri.conf.json', props.version)
}