import React, { PureComponent } from 'react'
import {
  Image,
  Platform,
} from 'react-native'
import styles from './style'
import PropTypes from 'prop-types'
import CacheUtil from './CacheUtil'
import default_avatar from '../../Images/default_avatar.png'
class CacheImage extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      imagePath: undefined, // 图片的本地地址
      imageSource: this.props.source
    }
    this.loadImage = this.loadImage.bind(this)
  }
  // 加载图片
  async loadImage(source){
    this.cacheUtil = new CacheUtil(source)
    // this.props.source，先判断本地是否有缓存
    // 存在->  则返回本地路径，再赋值给state.imagePath
    // 没有->  则下载，下载完成后，返回本地路径，再赋值给state.imagePath
    let result = await this.cacheUtil.existImage()
    if (result.isHas) {
      this.setState({
        imagePath: Platform.OS === 'ios' ? result.imagePath : 'file://' + result.imagePath
      })
    } else {
      this.cacheUtil.fetchImage((suc, imagPath) => {
        this.setState({
          imagePath: Platform.OS === 'ios' ? imagPath : 'file://' + imagPath
        })
      })
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.source != prevState.imageSource){
      return {
        imageSource:nextProps.source
      }
    }
    return null
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.source != this.props.source){
      // 图片地址更新时加载图片
      this.loadImage(this.props.source)
    }
  }

  componentDidMount() {
    // 第一次加载图片
    this.loadImage(this.props.source)
  }

  componentWillUnmount() {
    // 组件销毁，如果正在下载，则取消下载
    this.cacheUtil && this.cacheUtil.cancelAxiosRequest()
    this.cacheUtil = null
  }

  render() {
    const { imageStyle, defaultSource } = this.props
    const { imagePath } = this.state
    return (
      <Image
        key={imagePath ? imagePath : defaultSource + ''}
        style={[imageStyle, styles.backgroudStyle]} source={imagePath ? { uri: imagePath } : defaultSource} />
    )
  }
}

CacheImage.propTypes = {
  source: PropTypes.string.isRequired, // 图片url
  defaultSource: PropTypes.any, // 默认图片
  imageStyle: PropTypes.object, // 图片样式
}
CacheImage.defaultProps = {
  defaultSource: default_avatar       //默认图片
}
export default CacheImage