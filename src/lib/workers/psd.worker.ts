import PSD from '@webtoon/psd'
import axios from 'axios'

async function loadPsdBuffer() {
  const response = await axios.get('/psd/uymakon-a6.psd', {
    responseType: 'arraybuffer',
  })

  return response.data
}

globalThis.self.onmessage = async function (_e: MessageEvent) {
  const psdBuffer = await loadPsdBuffer()
  const psd = PSD.parse(psdBuffer)

  for (const [_index, layer] of psd.layers.entries()) {
    const pixel = await layer.composite(true, true)
    globalThis.self.postMessage({ status: true, message: pixel })
  }
}
