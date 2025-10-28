import { scan } from 'qr-scanner-wechat'
import sharp from 'sharp'

const image = sharp('/Volumes/public/kabin/datasets/konjac/images/2021/container_1/DJI_0043.JPG') // or Buffer, anything sharp supports

const { data, info } = await image
    // .resize(1000) // you can resize first to improve the performance
    .ensureAlpha()
    .raw()
    .toBuffer({
        resolveWithObject: true,
    })

const result = await scan({
    data: Uint8ClampedArray.from(data),
    width: info.width,
    height: info.height,
})

console.log(result?.text)