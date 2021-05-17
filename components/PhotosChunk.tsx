import {Asset} from 'expo-media-library';
import React, {useEffect, useState} from 'react';
import {Animated, Image, Text, StyleSheet, Dimensions, View, Platform, TouchableOpacity} from 'react-native';
import { layout } from '../types/interfaces';

const SCREEN_WIDTH = Dimensions.get('window').width;
const isIOS = Platform.OS === 'ios';
interface Props {
  photo: layout;
  opacity: Animated.AnimatedInterpolation;
  numCol: 2 | 3 | 4;
  loading: boolean;
  scale: Animated.Value;
  sortCondition: 'day'|'month';
  index: number;
  modalShown: boolean;
  setModalShown: Function;
  setSinglePhotoIndex: Function;
}

const PhotosChunk: React.FC<Props> = (props) => {
  const [imageRef, setImageRef] = useState<Image | null>();
  useEffect(()=>{
    if (isIOS && imageRef) {
      imageRef.setNativeProps({
        opacity: 0,
      });
    }
  },[imageRef,isIOS]);
  const handleOnLoad = () => {
    if (isIOS && imageRef) {
      imageRef.setNativeProps({
        opacity: 1,
      });
    }
  };

  const onPressImage = () => {
    console.log('image pressed '+props.index);
    props.setSinglePhotoIndex(props.index);
    props.setModalShown(true);
  }
  
  if(props.photo.sortCondition === props.sortCondition || props.photo.sortCondition === ""){
    if(typeof props.photo.value === 'string'){
      return (
        <View style={{flex: 1, width: SCREEN_WIDTH,}}>
          <Text>{props.photo.value}</Text>
        </View>
      )
    }else{
      return (
        <TouchableOpacity onPress={onPressImage} 
          style={[styles.Touchable,{width: SCREEN_WIDTH/props.numCol, 
            height: SCREEN_WIDTH/props.numCol, }]}
        
        >
          <View style={{zIndex:4, flex: 1/props.numCol, width: SCREEN_WIDTH/props.numCol,}}>
            <Image
              ref={ref => {
                setImageRef(ref);
              }}
              source={{uri: props.photo.value.uri}}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                height: SCREEN_WIDTH / props.numCol,
                width: SCREEN_WIDTH / props.numCol,
                backgroundColor: props.loading ? 'grey' : 'white',
                margin: 1,
                zIndex:4,
              }}
              key={props.photo.value.uri}
              onLoad={handleOnLoad}
            />
          </View>
        </TouchableOpacity>
      );
    }
  }else{
    return (
      <View style={{height:0, width:0}}></View>
    )
  }
};
const styles = StyleSheet.create({
  FlatList: {
    //flexDirection: "row",
    //flex: 1,
    //flexWrap:"wrap",
    width: SCREEN_WIDTH,
    //flexWrap: 'wrap',
    //flexGrow: 1,
  },
  Touchable: {
    backgroundColor: 'red',
    zIndex: 4
   }
});
export default PhotosChunk;
