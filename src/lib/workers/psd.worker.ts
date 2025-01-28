import { default as PSD, type NodeChild, type Layer as WLayer } from '@webtoon/psd'
import { byteArrayToBase64, initializeCanvas, type Layer, readPsd, writePsd, writePsdBuffer, writePsdUint8Array } from 'ag-psd'
import axios from 'axios'

function createCanvas(width: number, height: number) {
  const canvas = new OffscreenCanvas(width, height)
  canvas.width = width
  canvas.height = height
  return canvas
}

function createCanvasFromData(data: Uint8Array) {
  const image = new Image()
  image.src = `data:image/jpeg;base64,${byteArrayToBase64(data)}`
  const canvas = new OffscreenCanvas(image.width, image.height)
  canvas.width = image.width
  canvas.height = image.height
  canvas.getContext('2d')?.drawImage(image, 0, 0)
  return canvas
}

initializeCanvas(createCanvas as never, createCanvasFromData as never)

async function loadPsdBuffer() {
  const response = await axios.get('/psd/src.psd', {
    responseType: 'arraybuffer',
  })

  return response.data
}

// Layerlarni rekursiv qidirish
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

function findLayer2(layers: NodeChild[] | undefined, name: string): WLayer | null {
  if (!layers)
    return null

  for (const layer of layers) {
    if (layer.name === name)
      return layer as WLayer

    const found = findLayer2(layer.children, name)
    if (found)
      return found
  }

  return null
}

globalThis.self.onmessage = async function (_e: MessageEvent) {
  const psdBuffer = await loadPsdBuffer()

  // @webtoon/psd
  const wPsd = PSD.parse(psdBuffer)
  const sampleText = findLayer2(wPsd.children, 'EDIT_ME')
  
  console.log(sampleText?.additionalProperties)

  if (sampleText && sampleText.text) {
    sampleText.layerFrame.layerProperties.text = _e.data
  }

  const wImageData = await sampleText!.composite()
  postMessage({ status: true, imageData: wImageData, width: sampleText.width, height: sampleText.height })


  // ag-psd
  const psdSource = readPsd(psdBuffer, { skipLayerImageData: false, useImageData: true })

  // const smartObject = findLayer(psd.children, 'EDIT_ME')
  const smartObjectPSD = readPsd(psdSource.linkedFiles![0].data as never, { skipLayerImageData: false })
  const textLayer = findLayer(smartObjectPSD.children, 'TEXT_EDIT')

  const sampleTextlayer = findLayer(psdSource.children, 'SAMPLE_TEXT_EDIT')
  if (sampleTextlayer && sampleTextlayer.text && sampleTextlayer.text.text) {
    sampleTextlayer.text.text = _e.data
  }

  // if (textLayer && textLayer.text && textLayer.text.text) {
  //   textLayer.text.text = _e.data
  //   textLayer.canvas = undefined
  // }
  // const new_buff = writePsdUint8Array(smartObjectPSD, { invalidateTextLayers: true })

  // if (psd.linkedFiles && psd.linkedFiles[0] && psd.linkedFiles[0].data) {
  //   psd.linkedFiles[0].data = new_buff

    // psd.linkedFiles.push({
    //   id: `${psd.linkedFiles[0].id}-new`,
    //   name: 'mockup.psb',
    //   data: new_buff
    // })
  // }

  // if (smartObject && smartObject.placedLayer) {
  //   console.log(smartObject)
  //   // postMessage({ status: true, psd, bitmap: smartObject })
  // }

  const psdSourceBuffer = writePsd(psdSource, { invalidateTextLayers: true })
  const psd = readPsd(psdSourceBuffer, { useImageData: true })

  // postMessage({ status: true, imageData: psd.imageData })
}
