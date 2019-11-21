# CacheImage
图片缓存组件


依赖库

```
import RNFS from 'react-native-fs';
import CryptoJS from 'crypto-js'
import axios from 'axios'
import Base64ToArraybuffer from 'base64-arraybuffer'
```

使用

```
<CacheImage imageStyle={styles.Imagehead}
            source={item.picUrl}
            defaultSource={default_avatar} />
```
