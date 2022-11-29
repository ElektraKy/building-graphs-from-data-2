/****************************************************************************
** @license
**
***************************************************************************/
const mimeTypesByExtension: Record<string, string> = {
    txt: 'text/plain',
    json: 'application/json',
    svg: 'image/svg+xml',
    png: 'image/png',
    graphml: 'application/xml',
    pdf: 'application/pdf'
  }
  
  /**
   * Provides helper methods for file saving.
   */
  export default class FileSaveSupport {
    /**
     * Saves the file to the file system using the HTML5 File download or
     * the proprietary msSaveOrOpenBlob function in Internet Explorer.
     *
     * @param fileContent The file contents to be saved.
     * @param fileName The default filename for the downloaded file.
     * @return {Promise} A promise which resolves when the save operation is complete.
     */
    static save(fileContent: string, fileName: string): Promise<string> {
      return new Promise((resolve, reject) => {
        // extract file format
        const format = fileName.split('.')[1].toLowerCase()
        const mimeType = mimeTypesByExtension[format] || 'text/plain'
  
        if (FileSaveSupport.isFileConstructorAvailable()) {
          if (format in mimeTypesByExtension) {
            let blob = null
            if (format === 'pdf') {
              // encode content to make transparent images work correctly
              const uint8Array = new Uint8Array(fileContent.length)
              for (let i = 0; i < fileContent.length; i++) {
                uint8Array[i] = fileContent.charCodeAt(i)
              }
              blob = new Blob([uint8Array], { type: mimeType })
            } else if (format === 'png') {
              // save as binary data
              const dataUrlParts = fileContent.split(',')
              const bString = window.atob(dataUrlParts[1])
              const byteArray = []
              for (let i = 0; i < bString.length; i++) {
                byteArray.push(bString.charCodeAt(i))
              }
              blob = new Blob([new Uint8Array(byteArray)], { type: mimeType })
            } else {
              blob = new Blob([fileContent], { type: mimeType })
            }
  
            // workaround for supporting non-binary data
            fileContent = URL.createObjectURL(blob)
          }
  
          const aElement = document.createElement('a')
          aElement.setAttribute('href', fileContent)
          aElement.setAttribute('download', fileName)
          aElement.style.display = 'none'
          document.body.appendChild(aElement)
          aElement.click()
          document.body.removeChild(aElement)
  
          resolve('File saved successfully')
          return
        }
        if (FileSaveSupport.isMsSaveAvailable()) {
          let blob
          if (fileContent.startsWith('data:')) {
            const dataUrlParts = fileContent.split(',')
            const bString = window.atob(dataUrlParts[1])
            const byteArray = []
            for (let i = 0; i < bString.length; i++) {
              byteArray.push(bString.charCodeAt(i))
            }
            // For the options, extract the mime type from the Data URL
            blob = new Blob([new Uint8Array(byteArray)], {
              // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
              type: dataUrlParts[0].match(/:(.*?);/)![1]
            })
          } else if (format === 'pdf') {
            // encode content to make transparent images work correctly
            const uint8Array = new Uint8Array(fileContent.length)
            for (let i = 0; i < fileContent.length; i++) {
              uint8Array[i] = fileContent.charCodeAt(i)
            }
            blob = new Blob([uint8Array], { type: mimeType })
          } else {
            blob = new Blob([fileContent])
          }
  
          // @ts-ignore
          if (window.navigator.msSaveOrOpenBlob(blob, fileName)) {
            resolve('File saved successfully')
          } else {
            reject(new Error('File save failed: A failure occurred during saving.'))
          }
          return
        }
        reject(new Error('File save failed: Save operation is not supported by the browser.'))
      })
    }
  
    static isFileConstructorAvailable(): boolean {
      // Test whether required functions exist
      if (
        typeof window.URL !== 'function' ||
        typeof window.Blob !== 'function' ||
        typeof window.File !== 'function'
      ) {
        return false
      }
      // Test whether the constructor works as expected
      try {
        // eslint-disable-next-line no-new
        new File(['Content'], 'fileName', {
          type: 'image/png',
          lastModified: Date.now()
        })
      } catch (ignored) {
        return false
      }
      // Everything is available
      return true
    }
  
    /**
     * Returns whether the MS Internet Explorer specific save technique is available.
     * This works in IE 10+. See the related demo for more details.
     * for more details.
     * @return {boolean}
     */
    static isMsSaveAvailable(): boolean {
      return (
        typeof window.Blob === 'function' &&
        typeof (window.navigator as any).msSaveOrOpenBlob === 'function'
      )
    }
  }