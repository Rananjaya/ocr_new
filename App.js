import React, {useState} from 'react';
import {Button, StyleSheet, Text, View, Image} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import ProgressCircle from 'react-native-progress/Circle';
import moment from 'moment';
import TesseractOcr, {
  LANG_ENGLISH,
  useEventListener,
} from 'react-native-tesseract-ocr';

var RNFS = require('react-native-fs');

const DEFAULT_HEIGHT = 500;
const DEFAULT_WITH = 600;
const defaultPickerOptions = {
  cropping: true,
  height: DEFAULT_HEIGHT,
  width: DEFAULT_WITH,
};

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imgSrc, setImgSrc] = useState(null);
  const [text, setText] = useState('');
  useEventListener('onProgressChange', (p) => {
    setProgress(p.percent / 100);
  });


  const writeCsvToFile = async (myfile) => {
     
    //let str = 'jfhfh hfhhf 99.00 hfhfhfhfh hfhfhf';
    let str = myfile;
    
    let reco_text = str.match(/(0?[1-9]|[12]\d|30|31)[^\w\d\r\n:](0?[1-9]|1[0-2])[^\w\d\r\n:](\d{4}|\d{2})/g);
     let reco_time = str.match(/(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/)
     let amount = str.match(/^(\d{1,2})(,\d{2})*(,\d{1,3}){1}(\.\d{1,})?$/g)

     console.log("time >>",reco_time)
     console.log("amount >>",amount)
    if(reco_text != null && reco_text != ""){
         console.log("your date and time is",reco_text)
     }else{
       console.log("reco text not found",reco_text)
     }
    //document.getElementById('out').value = reco_text;

    console.log("res rana >>>",reco_text)

    const folderPath = `${RNFS.ExternalStorageDirectoryPath}/AirtelApp`;
    console.log("folder path ",folderPath)
    const folderExists = await RNFS.exists(folderPath);
    if (!folderExists) {
      console.log("folder not exits")
        await RNFS.mkdir(folderPath);
    }

    let contents = myfile;
    console.log("File Write",contents)
    const filePath = `${folderPath}/${moment().format('YYYYMMDDHHMMss')}.csv`;
    console.log("file path",filePath)
    try{
    await RNFS.writeFile(filePath, contents);
    }catch(err){
        console.log("file write error",err)
    }
}



  const recognizeTextFromImage = async (path) => {
    setIsLoading(true);

    try {
      const tesseractOptions = {};
      const recognizedText = await TesseractOcr.recognize(
        path,
        LANG_ENGLISH,
        tesseractOptions,
      );

       


      setText(recognizedText);
      writeCsvToFile(recognizedText);
     
       
      // console.log("res for date time",res)
    } catch (err) {
      console.error(err);
      setText('');
    }

    setIsLoading(false);
    setProgress(0);
  };

  const recognizeFromPicker = async (options = defaultPickerOptions) => {
    try {
      const image = await ImagePicker.openPicker(options);
      setImgSrc({uri: image.path});
      await recognizeTextFromImage(image.path);
    } catch (err) {
      if (err.message !== 'User cancelled image selection') {
        console.error(err);
      }
    }
    // writeCsvToFile();
  };

  const recognizeFromCamera = async (options = defaultPickerOptions) => {
    try {
      const image = await ImagePicker.openCamera(options);
      setImgSrc({uri: image.path});
      await recognizeTextFromImage(image.path);
    } catch (err) {
      if (err.message !== 'User cancelled image selection') {
        console.error(err);
      }
    }
  };

  return (
    <View style={styles.container}>
    
      <Text style={styles.instructions}>Please select image</Text>
      <View style={styles.options}>
        <View style={styles.button}>
          <Button
            disabled={isLoading}
            title="Camera"
            onPress={() => {
              recognizeFromCamera();
            }}
          />
        </View>
        <View style={styles.button}>
          <Button
            disabled={isLoading}
            title="Picker"
            onPress={() => {
              recognizeFromPicker();
            }}
          />
        </View>
      </View>
      {imgSrc && (
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={imgSrc} />
          {isLoading ? (
            <ProgressCircle showsText progress={progress} />
          ) : (
            <Text>{text}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  button: {
    marginHorizontal: 10,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    marginVertical: 15,
    height: DEFAULT_HEIGHT / 2.5,
    width: DEFAULT_WITH / 2.5,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default App;
