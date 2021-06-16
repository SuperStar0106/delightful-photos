import {Asset} from 'expo-media-library';
import React, {useEffect, useState, createRef, useRef} from 'react';
import { Animated, Image, Text, StyleSheet, useWindowDimensions, View, Platform, TextStyle } from 'react-native';
import { layout } from '../types/interfaces';
import { prettyTime } from '../utils/functions';
import { MaterialIcons } from '@expo/vector-icons'; 
import RoundCheckbox from './RoundCheckbox';


import {
  LongPressGestureHandler,
  TapGestureHandler,
  HandlerStateChangeEvent,
  TapGestureHandlerEventPayload,
  TapGestureHandlerGestureEvent,
  LongPressGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import { default as Reanimated, useAnimatedGestureHandler, useSharedValue } from 'react-native-reanimated';

import {
  useRecoilState,
} from 'recoil';
import {singlePhotoIndexState, imagePositionState} from '../states';
import { OnMove } from '../.history/components/ImageModal/types_20210517211851';

const isIOS = Platform.OS === 'ios';
interface Props {
  photo: layout;
  numCol: 2 | 3 | 4;
  sortCondition: 'day'|'month';
  index: number;
  modalShown: Reanimated.SharedValue<number>;
  headerShown: Reanimated.SharedValue<number>;
  headerHeight: number;
  onMediaLongTap: Function;
  animatedImagePositionX: Reanimated.SharedValue<number>;
  animatedImagePositionY: Reanimated.SharedValue<number>;
  animatedSingleMediaIndex: Reanimated.SharedValue<number>;
  singleImageWidth: Reanimated.SharedValue<number>;
  singleImageHeight: Reanimated.SharedValue<number>;
  showSelectionCheckbox: boolean;
  selectedAssets:Asset[]|undefined;
  imageWidth: number;
  imageHeight: number;
}


const PhotosChunk: React.FC<Props> = (props) => {
  const loading = false;
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;
  const imageRef = useRef<Image | null | undefined>();
  const animatedTempScale = useSharedValue(1);


  const handleOnLoad = () => {
    if (isIOS && imageRef) {
      imageRef.current?.setNativeProps({
        opacity: 1,
      });
    }
  };

  const _onTapGestureEvent = useAnimatedGestureHandler<TapGestureHandlerGestureEvent, {}>({
    onStart: (event)=>{
      console.log('onStart');
      animatedTempScale.value = Reanimated.withTiming(0.8,{duration:1000})
    },
    onActive: (event)=>{
      console.log('onActive');
      if(!props.showSelectionCheckbox){
        props.animatedImagePositionY.value = event.absoluteY - event.y;
        props.animatedImagePositionX.value = event.absoluteX - event.x;
        props.animatedSingleMediaIndex.value = props.index;
        const ratio = props.imageHeight/props.imageWidth;
        const screenRatio = SCREEN_HEIGHT/SCREEN_WIDTH;
        let height = SCREEN_HEIGHT;
        let width = SCREEN_WIDTH;
        if(ratio > screenRatio){
          width = SCREEN_HEIGHT/screenRatio;
        }else{
          height = SCREEN_WIDTH*screenRatio;
        }
        props.singleImageHeight.value = height;
        props.singleImageWidth.value = width;
        console.log('Opening modal');
        
        props.headerShown.value = 0;
        props.modalShown.value = 1;
      }else{
          //props.onMediaLongTap(props.photo.value);
      }
      animatedTempScale.value = Reanimated.withTiming(1,{duration:10})
    },
    onCancel:()=>{
      console.log('onCancel');
      animatedTempScale.value = Reanimated.withTiming(1,{duration:10})
    },
    onEnd:()=>{
      console.log('onEnd');
      animatedTempScale.value = Reanimated.withTiming(1,{duration:10})
    },
    onFail:()=>{
      console.log('onFail');
      animatedTempScale.value = Reanimated.withTiming(1,{duration:10})
    },
    onFinish:()=>{
      console.log('onFinish');
      animatedTempScale.value = Reanimated.withTiming(1,{duration:10})
    },
  });

  const _onLongGestureEvent = useAnimatedGestureHandler<LongPressGestureHandlerGestureEvent, {}>({
    onStart: (event)=>{
      console.log('onLongStart');
      animatedTempScale.value = Reanimated.withTiming(0.8,{duration:1000})
    },
    onActive: (event)=>{
      console.log('onLongActive');
    },
    onCancel: ()=>{
      console.log('onLongCancel');
    },
    onFail:()=>{
      console.log('onLongFail:when scroll before finish');
    },
    onEnd:()=>{
      console.log('onLongEnd:when long');
    },
    onFinish:()=>{
      console.log('onLongFinish:when scroll, tap or long');
    }
  })

  const longTapRef = createRef<LongPressGestureHandler>();
  const singleTapRef = createRef<TapGestureHandler>();
  const animatedStyle = Reanimated.useAnimatedStyle(()=>{
    return {
        opacity: animatedTempScale.value,
    };
  });

  const createThumbnail = (media:Asset) => {
    if(media.duration > 0){
      return (
        <>
          <Image
              ref={(ref:any) => {
                imageRef.current = ref;
              }}
              source={{uri: media.uri}}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                height: (SCREEN_WIDTH / props.numCol) - 2.5,
                width: (SCREEN_WIDTH / props.numCol) - 2.5,
                backgroundColor: loading ? 'grey' : 'white',
                margin: 2.5,
                zIndex: 4,
              }}
              key={media.uri}
              onLoad={handleOnLoad}
          />
          <View 
            style={styles.videoText}
          >
            <Text style={styles.durationText}>{prettyTime(media.duration)}</Text>
            <MaterialIcons name="play-circle-filled" size={20} color="white" />
          </View>
        </>
      );
    }else{
      return (
        <Image
              ref={(ref:any) => {
                imageRef.current = ref;
              }}
              source={{uri: media.uri}}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                height: (SCREEN_WIDTH / props.numCol) - 2.5,
                width: (SCREEN_WIDTH / props.numCol) - 2.5,
                backgroundColor: 'grey',
                margin: 2.5,
                zIndex:4,
              }}
              key={media.uri}
              onLoad={handleOnLoad}
        />
      );
    }
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
        <Reanimated.View style={[{
          zIndex:4, 
          width: SCREEN_WIDTH/props.numCol,
          height: SCREEN_WIDTH/props.numCol,
        }, animatedStyle]}>
        <LongPressGestureHandler
          ref={longTapRef}
          onGestureEvent={_onLongGestureEvent}
          minDurationMs={600}
        >
          <Reanimated.View 
            style={{
              width: SCREEN_WIDTH/props.numCol,
              height: SCREEN_WIDTH/props.numCol,
              zIndex:5
            }}>
            <TapGestureHandler
              ref={singleTapRef}
              onGestureEvent={_onTapGestureEvent}
            >
              <Reanimated.View
                style={{
                  height: (SCREEN_WIDTH / props.numCol),
                  width: (SCREEN_WIDTH / props.numCol),
                }}
              >
                 {createThumbnail(props.photo.value)}
              </Reanimated.View>
            </TapGestureHandler>
          </Reanimated.View>
        </LongPressGestureHandler>
        <View style={
          [
            styles.checkBox, 
            {
              opacity:props.showSelectionCheckbox?1:0
            }
          ]
        } >
          <RoundCheckbox 
            size={24}
            checked={props.selectedAssets?.findIndex(x=>(typeof props.photo.value!=='string' && x.id===props.photo.value.id))===-1?false:true}
            borderColor='whitesmoke'
          />
          </View>
        </Reanimated.View>
      );
    }
  }else{
    return (
      <View style={{height:0, width:0}}></View>
    )
  }
};
const styles = StyleSheet.create({
  durationText:{
    color: 'whitesmoke',
    position: 'relative',
    marginRight:5
  },
  videoText: {
    zIndex:4,
    height: 20,
    position: 'absolute',
    top:5,
    right: 5,
    flex: 1,
    flexDirection:'row',
  },
  checkBox:{
    zIndex:4,
    position: 'absolute',
    top:5,
    left: 5,
    flex: 1,
    flexDirection:'row',
    color: 'white',
  }
});

export default PhotosChunk;
