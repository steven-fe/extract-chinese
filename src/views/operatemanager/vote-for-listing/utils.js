import { filesUploadAws } from '@/api/upload/upload'

class UploadImage {
  static getImageFileUrl = async(imageFile) => new Promise((resolve) => {
    const render = new FileReader()
    render.onload = (e) => resolve(e.target.result)
    render.readAsDataURL(imageFile)
  })

  static getImageSize = async(imageUrl) => new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve([image.width, image.height])
    image.src = imageUrl
  })

  constructor() {
    this.imageFileInput = null
    this.initImageFileInput()
  }

  initImageFileInput() {
    this.imageFileInput = document.createElement('input')
    this.imageFileInput.type = 'file'
    this.imageFileInput.onchange = async() => {
      const imageFile = this.imageFileInput.files[0]
      const params = { file: imageFile }

      try {
        await this.checkImageIntrinsicSize(imageFile)
        const { data } = await filesUploadAws(params)
        if (this.uploadResolve) this.uploadResolve(data.fullPath)
      } catch (e) {
        if (this.uploadReject) this.uploadReject(e)
      }
    }
  }

  async checkImageIntrinsicSize(imageFile) {
    if (!this.intrinsicSize || this.intrinsicSize === '*') return

    const [width, height] = await UploadImage.getImageSize(await UploadImage.getImageFileUrl(imageFile))

    if (/^\d+\:\d+$/.test(this.intrinsicSize)) {
      // a:b
      const [widthRatio, heightRatio] = this.intrinsicSize.split(':')
      if ((+widthRatio / +heightRatio) !== (width / height)) throw new Error('[UploadImage-WrongImageRatio]')
    } else if (/^\d+\*\d+$/.test(this.intrinsicSize)) {
      // a*b
      if (this.intrinsicSize !== `${width}*${height}`) throw new Error('[UploadImage-WrongImageSize]')
    }
  }

  upload({ accept, intrinsicSize } = {}) {
    this.imageFileInput.accept = accept || 'image/*'
    this.imageFileInput.multiple = false
    this.intrinsicSize = intrinsicSize || '*' // '*', '1:1', '690*240'

    this.imageFileInput.value = ''
    this.imageFileInput.click()

    return new Promise((resolve, reject) => {
      this.uploadResolve = resolve
      this.uploadReject = reject
    })
  }
}

const _uploadImage = new UploadImage()

export const uploadImage = (() => _uploadImage.upload.bind(_uploadImage))()
