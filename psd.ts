import fs from 'node:fs'
import { resolve } from 'node:path'
import { Layer, readPsd, writePsdBuffer } from 'ag-psd'
import 'ag-psd/initialize-canvas'

function findLayer(layers: Layer[] | undefined, name: string): Layer | null {
    if (!layers)
      return null
  
    for (const layer of layers) {
      if (layer.name === name)
        return layer
  
      const found = findLayer(layer.children, name)
      if (found)
        return found
    }

    return null
  }

const SOURCE_FILE = resolve(process.cwd(), 'static/psd/src.psd')
const OUTPUT_FILE = resolve(process.cwd(), 'static/psd/src_out_new_2.psd')
const OUTPUT_FILE_PNG = resolve(process.cwd(), 'static/psd/src_out_new.png')

const psdFile = fs.readFileSync(SOURCE_FILE)

const psd = readPsd(psdFile, { useImageData: true })

const sampleTextLayer = findLayer(psd.children, 'SAMPLE_TEXT_EDIT')
if (sampleTextLayer && sampleTextLayer.text && sampleTextLayer.text.text) {
    sampleTextLayer.text.text = 'Generator Function v2'
}

const linkedFile = !!psd.linkedFiles
    ? psd.linkedFiles[0]
    : undefined

if (linkedFile && !!linkedFile.data) {
    const linkedPsd = readPsd(linkedFile.data)
    const textLayer = findLayer(linkedPsd.children, 'TEXT_EDIT')

    if (textLayer && textLayer.text && textLayer.text.text) {
        textLayer.text.text = 'MOCK'
    }

    // const linked
}

const outputBuffer = writePsdBuffer(psd, { invalidateTextLayers: true })
const newPsd = readPsd(outputBuffer)

fs.writeFileSync(OUTPUT_FILE, outputBuffer)
// fs.writeFileSync(OUTPUT_FILE_PNG, (newPsd.canvas! as any).toBuffer())
