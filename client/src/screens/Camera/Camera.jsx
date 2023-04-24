import { Camera, CameraType } from "expo-camera"
import { useState, useEffect, useRef } from "react"
import { Button, Text, TouchableOpacity, View } from "react-native"
import { useIsFocused } from "@react-navigation/native"
import getAspectRatio from "../../utils/getAspectRatio.js"
import findBestMatchingAspectRatio from "../../utils/findBestMatchingAspectRatio.js"
import CameraStyles from "./Camera.styles.js"

const CameraScreen = ({ navigation }) => {
  const [type, setType] = useState(CameraType.back)
  const [permission, requestPermission] = Camera.useCameraPermissions()
  const [cameraRatio, setCameraRatio] = useState()
  const [isCameraReady, setIsCameraReady] = useState(false)

  const cameraRef = useRef()
  const isFocused = useIsFocused()
  
  const onCameraReady = () => {
    setIsCameraReady(true)
  }

  useEffect(() => {
    const setBestMatchingRatio = async () => {
      const aspectRatio = getAspectRatio()

      if (cameraRef.current && isCameraReady) {
        const supportedRatios =
          await cameraRef.current.getSupportedRatiosAsync()
        const bestRatio = findBestMatchingAspectRatio(
          supportedRatios,
          aspectRatio
        )
        setCameraRatio(bestRatio)
      }
    }

    setBestMatchingRatio()
  }, [cameraRef, isCameraReady])

  if (!permission) {
    // Camera permissions are still loading
    return <View />
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={CameraStyles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    )
  }

  const takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false,
    }
    let newPhoto = await cameraRef.current.takePictureAsync(options)
    navigation.navigate("Preview", {
      photo: newPhoto,
    })
  }

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    )
  }

  return (
    <View style={CameraStyles.container}>
      {isFocused && (
        <Camera
          type={type}
          style={CameraStyles.camera}
          ref={cameraRef}
          ratio={cameraRatio}
          onCameraReady={onCameraReady}
        >
          <View style={CameraStyles.buttonContainer}>
            <TouchableOpacity
              style={CameraStyles.button}
              onPress={toggleCameraType}
            >
              <Text style={CameraStyles.text}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={CameraStyles.button} onPress={takePic}>
              <Text style={CameraStyles.text}>Capture</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      )}
    </View>
  )
}

export default CameraScreen
