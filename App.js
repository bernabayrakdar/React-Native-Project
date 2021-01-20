import storage from '@react-native-firebase/storage';
import * as Progress from 'react-native-progress';
import * as firebase from '@react-native-firebase/app';
import React, {useState} from 'react';
import {SafeAreaView,StyleSheet,Text,View,TouchableOpacity,Image,Alert,Platform,PermissionsAndroid,} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const App = () => {

  let result, resultJson, objects;  
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [filePath, setFilePath] = useState({});

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };

  const requestExternalWritePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'External Storage Write Permission',
            message: 'App needs write permission',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        alert('Write permission err', err);
      }
      return false;
    } else return true;
  };

  const captureImage = async (type) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
      saveToPhotos: true,    
      storageOptions: {
       skipBackup: true,
       path: 'images'
     }
    };
    let isCameraPermitted = await requestCameraPermission();
    let isStoragePermitted = await requestExternalWritePermission();
   
    if (isCameraPermitted && isStoragePermitted) {
      launchCamera(options, (response) => {
        console.log('Response = ', response);

        if (response.didCancel) {
          alert('User cancelled camera picker');
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          alert('Camera not available on device');
          return;
        } else if (response.errorCode == 'permission') {
          alert('Permission not satisfied');
          return;
        } else if (response.errorCode == 'others') {
          alert(response.errorMessage);
          return;
        }else {
        
        console.log('base64 -> ', response.base64);
        console.log('uri -> ', response.uri);
        console.log('width -> ', response.width);
        console.log('height -> ', response.height);
        console.log('fileSize -> ', response.fileSize);
        console.log('type -> ', response.type);
        console.log('fileName -> ', response.fileName);
        setFilePath(response);
        const source = { uri: response.uri };
        console.log(source);
        setImage(source);
        }        
      });
    }
  };

  const uploadImage = async () => {
   const { uri } = image;
   const filename = uri.substring(uri.lastIndexOf('/') + 1);
   const uploadUri = Platform.OS === 'android' ? uri.replace('file://', '') : uri;
   setUploading(true);
   setTransferred(0);
   let task = storage()
     .ref(filename)
     .putFile(uploadUri);
    task.on('state_changed', snapshot => {
      setTransferred(
       Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000
      );
   });
  try {
    await task;
  } catch (e) {
    console.error(e);
  }
   setUploading(false);
    Alert.alert(
    'Photo Uploaded!'
  );
  setImage(null);
 };

  const chooseFile = (type) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
      storageOptions: {
       skipBackup: true,
       path: 'images'
      }
    };
    launchImageLibrary(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        alert('User cancelled camera picker');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }else { console.log('base64 -> ', response.base64);

      console.log('uri -> ', response.uri);
      console.log('width -> ', response.width);
      console.log('height -> ', response.height);
      console.log('fileSize -> ', response.fileSize);
      console.log('type -> ', response.type);
      console.log('fileName -> ', response.fileName);
      setFilePath(response);
      const source = { uri: response.uri };
      console.log(source);
      setImage(source);
      }     
    });
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <Image
          source={{uri: filePath.uri}}
          style={styles.imageStyle}
        />
        <View style={styles.textStyle}>
        {image !== null ? (
          <Image source={{ uri: image.uri }} style={styles.textStyle} />
        ) : null}
        {uploading ? (
          <View style={styles.textStyle}>
            <Progress.Bar progress={transferred} width={300} />
          </View>
        ) : (
          <TouchableOpacity 
           style={styles.buttonStyle} 
           onPress={uploadImage}>
          <Text style={styles.textStyle}>Upload Image</Text>
          </TouchableOpacity>
        )}
      </View>
        <Text style={styles.textStyle}>{filePath.uri}</Text>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={() => captureImage('photo')}>
          <Text style={styles.textStyle}>CAMERA</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={() => chooseFile('photo')}>
          <Text style={styles.textStyle}>Galery</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#778899',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
  },
  textStyle: {
    padding: 10,    
    textAlign: 'center',
  },
  buttonStyle: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 5,
    marginVertical: 10,
    width: 250,
  },
  imageStyle: {
    width: 200,
    height: 200,
    margin: 5,
  },
});