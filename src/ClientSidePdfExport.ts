/****************************************************************************
** @license
**
***************************************************************************/
import { GraphComponent, IGraph, Insets, Rect, Size, SvgExport } from 'yfiles'
import { PaperSize } from './SampleApplication'

// The open-source library for PDF export https://github.com/MrRio/jsPDF alongside with
// https://github.com/yWorks/svg2pdf.js/ to convert a given SVG element to PDF.
declare const jspdf: any

/**
 * A class that provides PDF export in the client's browser.
 * yFiles' {@link SvgExport} is used to export the contents of a {@link GraphComponent} into an
 * SVG document which is subsequently converted into a PDF document by jsPDF.
 */
export default class ClientSidePdfExport {
  /**
   * The scaling of the exported image.
   */
  scale = 1

  /**
   * The margins for the exported image.
   */
  margins = new Insets(5)

  /**
   * The size of the exported PDF.
   */
  paperSize = PaperSize.AUTO

  /**
   * Exports the {@link IGraph} to PDF with the help of {@link SvgExport} and jsPDF.
   */
  async exportPdf(graph: IGraph, exportRect: Rect | null): Promise<{ raw: string; uri: string }> {
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

    if (window.btoa != null) {
      // Don't use base 64 encoding if btoa is not available and don't inline images as-well.
      exporter.encodeImagesBase64 = true
      exporter.inlineSvgImages = true
    }

    // export the component to svg
    const svgElement = await exporter.exportSvgAsync(exportComponent)

    const size = getExportSize(this.paperSize, exporter)
    return convertSvgToPdf(svgElement as SVGElement, size)
  }
}

/**
 * Converts the given SVG element to PDF.
 * @yjs:keep=compress,orientation
 */
function convertSvgToPdf(
  svgElement: SVGElement,
  size: Size
): Promise<{ raw: string; uri: string }> {
  svgElement = svgElement.cloneNode(true) as SVGElement

  const sizeArray = [size.width, size.height]
  // eslint-disable-next-line no-undef,new-cap
  const jsPdf = new jspdf.jsPDF({
    orientation: sizeArray[0] > sizeArray[1] ? 'l' : 'p',
    unit: 'pt',
    format: sizeArray,
    compress: true,
    floatPrecision: 'smart'
  })

  const options = {
    width: sizeArray[0],
    height: sizeArray[1]
  }

  return jsPdf
    .svg(svgElement, options)
    .then(() => ({ raw: jsPdf.output(), uri: jsPdf.output('datauristring') }))
}

/**
 * Returns the size of the exported PDF. Paper sizes are converted to pixel sizes based on 72 PPI.
 */
function getExportSize(paperSize: PaperSize, exporter: SvgExport): Size {
  switch (paperSize) {
    case PaperSize.A3:
      return new Size(842, 1191)
    case PaperSize.A4:
      return new Size(595, 842)
    case PaperSize.A5:
      return new Size(420, 595)
    case PaperSize.A6:
      return new Size(298, 420)
    case PaperSize.LETTER:
      return new Size(612, 792)
    case PaperSize.AUTO:
      return new Size(exporter.viewWidth, exporter.viewHeight)
  }
}