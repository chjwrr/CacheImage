import RNFS from 'react-native-fs';
import CryptoJS from 'crypto-js'
import axios from 'axios'
import Base64ToArraybuffer from 'base64-arraybuffer'
const IM_IMAGES = RNFS.DocumentDirectoryPath + '/IMImages/'
//判断是否存在聊天图片文件夹，没有则创建
RNFS.exists(IM_IMAGES).then((result) => {
  if (!result) {
    RNFS.mkdir(IM_IMAGES)
  }
})
export default class CacheUtil {
  constructor(imageURL, IMImages) {
    this.axiosFetchRequestCancel = null
    this.imageUrl = imageURL
    this.IMImages = IMImages
  }

  /**
   * [existImage  判断图片是否存缓存]
   * imageUrl     [图片的网络路径]
   * @return      [返回是/否]
   */
  existImage = async () => {
    try {
      let imagePath = this.getImagePath(this.imageUrl)
      const result = await RNFS.exists(imagePath).catch(e => console.log('e', e))
      return {
        isHas: result,
        imagePath
      }
    } catch (e) {
      return {
        isHas: false,
      }
    }
  }

  /**
   * [getImagePath  获取图片的本地路径]
   * imageUrl       [图片的网络路径]
   * @return        [返回图片的本地路径]
   */
  getImagePath = () => {
    return this._getLocalPath(this.imageUrl) + this._getImageName(this.imageUrl)
  }

  /**
   * [fetchImage  下载图片]
   * imageUrl     [图片的网络路径]
   * @return      [返回图片的本地路径]
   */
  fetchImage = (callBack) => {
    // 获取远端图片
    let that = this
    try {
      axios(this.imageUrl,
        {
          responseType: 'arraybuffer',
          cancelToken: new axios.CancelToken(function executor(c) {
            that.axiosFetchRequestCancel = c // 用于取消下载
          })
        }
      )
        .then(function (response) {
          let base64 = Base64ToArraybuffer.encode(response.data)
          let imagePath = that.getImagePath(that.imageUrl)
          that.axiosFetchRequestCancel = null
          RNFS.writeFile(imagePath, base64, 'base64').then(() => {
            callBack && callBack(true, imagePath)
          }).catch(e => {
            callBack && callBack(false)
          })
        }).catch(error => {
          callBack && callBack(false)
        });
    } catch (e) {
    }
  }

  /**
   * [cancelAxiosRequest 取消axios post请求]
   */
  cancelAxiosRequest = () => {
    this.axiosFetchRequestCancel && this.axiosFetchRequestCancel('cancel')
  }

  /**
   * [getLocalPath 获取图片缓存的文件夹]
   */
  _getLocalPath = () => {
    if (this.IMImages) {
      return IM_IMAGES
    }
    return RNFS.DocumentDirectoryPath + '/Avatar/'
  }

  /**
   * [getImageSuffixName 获取图片的后缀名]
   */
  _getImageSuffixName = () => {
    let arr = this.imageUrl.split('.')
    return '.' + arr[arr.length - 1]
  }

  /**
   * [getImageMD5 获取图片MD5码，用于得到图片的本地名字]
   */
  _getImageMD5 = () => {
    return CryptoJS.MD5(this.imageUrl).toString()
  }

  /**
   * [getImageName 获取图片的完整名字]
   */
  _getImageName = () => {
    return this._getImageMD5(this.imageUrl) + this._getImageSuffixName(this.imageUrl)
  }

}
