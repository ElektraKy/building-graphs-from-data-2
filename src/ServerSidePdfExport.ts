/****************************************************************************
** @license
**
***************************************************************************/
import { GraphComponent, IGraph, Insets, Rect, Size, SvgExport } from 'yfiles'
import { PaperSize } from './SampleApplication'

/**
 * A class that provides PDF export on the server-side.
 * yFiles' {@link SvgExport} is used to export the contents of a {@link GraphComponent} into an
 * SVG document which is subsequently send to a server where it is converted into a PDF document.
 */
export default class ServerSidePdfExport {
  /**
   * The scaling of the exported image.
   */
  scale = 1

  /**
   * The margins for the exported image.
   */
  margins = new Insets(5)

  /**
   * The size of the exported PDF. If not set, the size is adjusted to the exported area.
   */
  paperSize = PaperSize.AUTO

  /**
   * Creates a new instance of the {@link ServerSidePdfExport}.
   */
  constructor() {
    ServerSidePdfExport.initializeForm()
  }

  /**
   * Exports an SVG element of the passed {@link IGraph}.
   */
  async exportSvg(
    graph: IGraph,
    exportRect: Rect | null
  ): Promise<{ element: SVGElement; size: Size }> {
    // Create a new graph component for exporting the original SVG content
    const exportComponent = new GraphComponent()
    // ... and assign it the same graph.
    exportComponent.graph = graph
    exportComponent.updateContentRect()

    // Determine the bounds of the exported area
    const targetRect = exportRect || exportComponent.contentRect

    // Create the exporter class
    const exporter = new SvgExport({
      worldBounds: targetRect,
      scale: this.scale,
      margins: this.margins
    })

    if (window.btoa !== undefined) {
      // Don't use base 64 encoding if btoa is not available and don't inline images as-well.
      exporter.encodeImagesBase64 = true
      exporter.inlineSvgImages = true
    }

    const svgElement = await exporter.exportSvgAsync(exportComponent)
    return {
      element: svgElement as SVGElement,
      size: new Size(exporter.viewWidth, exporter.viewHeight)
    }
  }

  /**
   * Send the request to the server which initiates a file download.
   */
  requestFile(url: string, format: string, svgString: string, size: Size): void {
    const svgStringInput = document.getElementById('postSvgString') as HTMLInputElement
    svgStringInput.setAttribute('value', `${svgString}`)
    const formatInput = document.getElementById('postFormat') as HTMLInputElement
    formatInput.setAttribute('value', `${format}`)
    const width = document.getElementById('postWidth') as HTMLInputElement
    width.setAttribute('value', `${size.width}`)
    const height = document.getElementById('postHeight') as HTMLInputElement
    height.setAttribute('value', `${size.height}`)
    const margin = document.getElementById('postMargin') as HTMLInputElement
    margin.setAttribute('value', `${this.margins ? this.margins.left : 5}`)
    const paperSize = document.getElementById('postPaperSize') as HTMLInputElement
    paperSize.setAttribute('value', this.paperSize === PaperSize.AUTO ? '' : this.paperSize)

    const form = document.getElementById('postForm') as HTMLFormElement
    form.setAttribute('action', url)
    form.submit()
  }

  /**
   * Adds a form to the document body that is used to request the PDF from the server.
   */
  private static initializeForm(): void {
    const form = document.createElement('form')
    form.style.display = 'none'
    form.id = 'postForm'
    form.method = 'post'
    const svgString = document.createElement('input')
    svgString.id = 'postSvgString'
    svgString.name = 'svgString'
    svgString.type = 'hidden'
    form.appendChild(svgString)
    const format = document.createElement('input')
    format.id = 'postFormat'
    format.name = 'format'
    format.type = 'hidden'
    form.appendChild(format)
    const width = document.createElement('input')
    width.id = 'postWidth'
    width.name = 'width'
    width.type = 'hidden'
    form.appendChild(width)
    const height = document.createElement('input')
    height.id = 'postHeight'
    height.name = 'height'
    height.type = 'hidden'
    form.appendChild(height)
    const margin = document.createElement('input')
    margin.id = 'postMargin'
    margin.name = 'margin'
    margin.type = 'hidden'
    form.appendChild(margin)
    const paperSize = document.createElement('input')
    paperSize.id = 'postPaperSize'
    paperSize.name = 'paperSize'
    paperSize.type = 'hidden'
    form.appendChild(paperSize)

    document.body.appendChild(form)
  }
}