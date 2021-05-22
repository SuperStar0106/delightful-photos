import React, { useState, useEffect, createRef, useRef } from 'react';
import {useWindowDimensions , Animated, StyleSheet, View, StatusBar } from 'react-native';
import { useBackHandler } from '@react-native-community/hooks'
import Media from './Media';
import { Asset } from 'expo-media-library';
import { RecyclerListView, DataProvider, } from 'recyclerlistview';
import { LayoutUtil } from '../utils/LayoutUtil';

import {
  LongPressGestureHandler,
  PanGestureHandler,
  HandlerStateChangeEvent,
  PanGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';

interface Props {
  modalShown: boolean;
  setModalShown: Function;
  medias: Asset[]|undefined;
  singleMediaIndex: number;
  imagePosition: {x:number, y:number};
  numColumns: 2|3|4;
}

const SingleMedia: React.FC<Props> = (props) => {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;

  const [media, setMedia] = useState<Asset|undefined>(undefined);
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const viewPosition = useRef(new Animated.ValueXY(props.imagePosition)).current;
  const viewScale = useRef(new Animated.ValueXY({x:0,y:0})).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const scrollRef:any = useRef();
  const [dataProvider, setDataProvider] = useState<DataProvider>(new DataProvider((r1, r2) => {
    return r1 !== r2;
  }));
  const [layoutProvider, setLayoutProvider] = useState<any>(LayoutUtil.getSingleImageLayoutProvider());

  const calcImageDimension = (media:Asset|undefined) => {
    let imageWidth_t = SCREEN_WIDTH;
    let imageHeight_t = SCREEN_HEIGHT;
    if(media){
      if(media.height > SCREEN_HEIGHT && media.width > SCREEN_WIDTH){
        if(media.height/media.width > SCREEN_HEIGHT/SCREEN_WIDTH){
          imageWidth_t = media.width * SCREEN_HEIGHT/(media.height==0?1:media.height);
        }else{
          imageHeight_t = SCREEN_WIDTH * media.height/(media.width==0?1:media.width);
        }
      }else if(media.height > SCREEN_HEIGHT){
        imageWidth_t = media.width * SCREEN_HEIGHT/(media.height==0?1:media.height);
      }else if(media.width > SCREEN_WIDTH){
        imageHeight_t = SCREEN_WIDTH * media.height/(media.width==0?1:media.width);
      }else if(media.height <= SCREEN_HEIGHT && media.width <= SCREEN_WIDTH){
        imageHeight_t = media.height;
        imageWidth_t = media.width ;
      }																												
    }
    return {height: imageHeight_t, width: imageWidth_t}
  };

  useEffect(()=>{
    if(props.medias){
      setDataProvider(dataProvider.cloneWithRows(props.medias));
    }
  }, [props.medias]);

  useEffect(()=>{
    let imageDimensions = calcImageDimension(media);
    showHideModal(props.modalShown, imageDimensions.width, imageDimensions.height);
    if(props.modalShown){
      scrollRef?.current?.scrollToIndex(props.singleMediaIndex, false);
    }
  },[media]);


  useEffect(()=>{
    console.log('in SingleMedia props.modalShown='+props.modalShown);
    if(props.medias){
      let media:Asset = props.medias[props.singleMediaIndex];
      if(media && typeof media !== 'string'){
        setMedia(media);
      }
    }
  },[props.modalShown]);

  const hideModalAnimation = (duration:number=400) => {
    let imageDimensions = calcImageDimension(media);
    Animated.parallel([
      Animated.timing(viewPosition, {
        toValue: props.imagePosition,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(viewScale, {
        toValue: {x:SCREEN_WIDTH/(props.numColumns*imageDimensions.width), y:2*SCREEN_WIDTH/(props.numColumns*imageDimensions.height*2)},
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(translationY, {
        toValue: 0,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(translationX, {
        toValue: 0,
        duration: duration,
        useNativeDriver: true,
      }),
    ]).start(()=>{
      
    });
    setTimeout(()=>{
      console.log('setting modalShown to false')
      props.setModalShown(false);
      viewScale.setValue({x:0, y:0});
    }, duration/2)
  }
  const showModalAnimation = (duration:number=300) => {
    let imageDimensions = calcImageDimension(media);
    //console.log('in showModalAnimation:', {SCREEN_WIDTH:SCREEN_WIDTH, imageWidth:imageWidth, SCREEN_HEIGHT:SCREEN_HEIGHT, imageHeight:imageHeight, StatusBar: StatusBar.currentHeight});
    Animated.parallel([
      Animated.timing(viewPosition, {
        toValue: { x: (SCREEN_WIDTH-imageDimensions.width)/2, y: (SCREEN_HEIGHT-imageDimensions.height+2*(StatusBar.currentHeight||0))/2 },
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(viewScale, {
        toValue: { x: 1, y: 1},
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(translationY, {
        toValue: 0,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }),
    ]).start();
  }
  useBackHandler(() => {
    if (props.modalShown) {
      hideModalAnimation();
      return true
    }
    // let the default thing happen
    return false
  })
  const showHideModal = (showModal:boolean, imageWidth:number, imageHeight:number) => {
    if(showModal){
      viewPosition.setValue(props.imagePosition);
      viewScale.setValue({x:SCREEN_WIDTH/(props.numColumns*imageWidth), y:2*SCREEN_WIDTH/(props.numColumns*imageHeight*2)})
      showModalAnimation();
    }else{
      console.log('closing image');
    }
  }

 
  let singleTapRef = createRef();
  
 
  let translationX = new Animated.Value(0);
  let translationY = new Animated.Value(0);

  let translationYvsX = Animated.multiply(translationY, Animated.divide(translationX, Animated.add(translationY,0.0000001)).interpolate({
    inputRange: [-SCREEN_WIDTH, -1, -0.60, 0, 0.60, 1, SCREEN_WIDTH],
    outputRange: [0,             0,  0,    1, 0,    0, 0],
  }))

  
  const _onPanHandlerStateChange = ( event:HandlerStateChangeEvent<PanGestureHandlerEventPayload> ) => {
    if (event.nativeEvent.oldState === State.ACTIVE && event.nativeEvent.state !== State.ACTIVE) {
      if( (event.nativeEvent.translationY > 50 || event.nativeEvent.translationY < -50) && (((event.nativeEvent.translationX/(event.nativeEvent.translationY+1))>0 && (event.nativeEvent.translationX/(event.nativeEvent.translationY+1))<0.6) || ((event.nativeEvent.translationX/(event.nativeEvent.translationY+1))<0 && (event.nativeEvent.translationX/(event.nativeEvent.translationY+1))>-0.6))){
        hideModalAnimation();
      }else if(event.nativeEvent.translationY <= 50 && event.nativeEvent.translationY >= -50){
        showModalAnimation();
      }
    }else if (event.nativeEvent.oldState !== State.ACTIVE && event.nativeEvent.state === State.ACTIVE) {
      if( ((event.nativeEvent.velocityX/(event.nativeEvent.velocityY+1))>0.6) || ((event.nativeEvent.translationX/(event.nativeEvent.translationY+1))<-0.6) ){
        console.log('scroll started');
        setScrollEnabled(true);
        let newIndex = -1;
        if(event.nativeEvent.velocityX > 0){
          newIndex = props.singleMediaIndex - 1;
        }else if(event.nativeEvent.velocityX < 0){
          newIndex = props.singleMediaIndex + 1;
        }
        if(newIndex > -1 && scrollRef){
          scrollRef?.current?.scrollToIndex(newIndex, true);
        }
      }
    }
  }
  const _onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translationX, translationY: translationY } }],
    { useNativeDriver: true }
  );

  

  const _onLongTapHandlerStateChange = ( event:HandlerStateChangeEvent<TapGestureHandlerEventPayload> ) => {
    if (event.nativeEvent.oldState === State.ACTIVE && event.nativeEvent.state !== State.ACTIVE) {
      console.log('long tap');
    }
  }
  

  return (
    <View style={{zIndex:props.modalShown?1:0, opacity:props.modalShown?1:0,width:SCREEN_WIDTH, height:SCREEN_HEIGHT}}>
      <Animated.View 
        style={[styles.ModalView, {
          opacity:modalOpacity.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0, 1, 1],
          }), 
          width:props.modalShown?SCREEN_WIDTH:0,
          height:props.modalShown?SCREEN_HEIGHT:0,
          top: 0,
          left: 0,
          transform: [
            {
              translateY: Animated.subtract(Animated.add(viewPosition.y, translationYvsX),StatusBar.currentHeight||0)
            },
            {
              translateX: viewPosition.x
            }
          ],
        }]}
      >
      <Animated.View 
        style={[ {
          //opacity:modalOpacity, 
          position: 'relative',
          width:'100%',
          height:'100%',
          top: 0,
          left: 0,
          transform: [
            {
              scale: translationYvsX.interpolate({
                inputRange: [-SCREEN_HEIGHT, -100, 0, 100, SCREEN_HEIGHT],
                outputRange: [0.9, 0.9, 1, 0.9, 0.9],
              }),
            },
            { 
              scaleX: viewScale.x
            },
            {
              scaleY: viewScale.y,
            },
            {
              translateX: Animated.divide(
                Animated.subtract(
                  Animated.multiply(
                    viewScale.x,SCREEN_WIDTH), 
                  SCREEN_WIDTH)
                , Animated.multiply(2,Animated.add(viewScale.x, 0.000001)))
            },
            {
              translateY: Animated.divide(
                Animated.subtract(
                  Animated.multiply(
                    viewScale.y,(SCREEN_HEIGHT)
                  ), (SCREEN_HEIGHT)
                )
                , Animated.multiply(2,Animated.add(viewScale.y, 0.000001)))
            }
          ],
        }]}
      >
        <LongPressGestureHandler
          onHandlerStateChange={_onLongTapHandlerStateChange}
          minDurationMs={800}
        >
          <Animated.View>
            <PanGestureHandler
              maxPointers={1}
              ref={singleTapRef}
              onHandlerStateChange={_onPanHandlerStateChange}
              onGestureEvent={_onPanGestureEvent}
            >
              <Animated.View style={{width:SCREEN_WIDTH, height:SCREEN_HEIGHT}}>
                <RecyclerListView
                  ref={scrollRef}
                  isHorizontal={true}
                  dataProvider={dataProvider}
                  layoutProvider={layoutProvider}
                  renderAheadOffset={1}
                  initialRenderIndex={props.singleMediaIndex}
                  onVisibleIndicesChanged={(indexes) => {
                    setActiveIndex(indexes[0]);
                    console.log('test');
                  }}
                  scrollViewProps={{
                    disableIntervalMomentum: true,
                    disableScrollViewPanResponder: true,
                    scrollEnabled: false,
                    horizontal: true,
                    pagingEnabled: true,
                  }}
                  style={{width:SCREEN_WIDTH, height:SCREEN_HEIGHT}}
                  rowRenderer={(type:string | number, item:Asset, index: number) => (
                    <Media
                      imageHeight={calcImageDimension(item).height}
                      imageWidth={calcImageDimension(item).width}
                      media={item}
                      showModal={props.modalShown}
                      activeIndex={activeIndex}
                      index={index}
                    />
                  )}
                />
              </Animated.View>             
            </PanGestureHandler>
          </Animated.View>
        </LongPressGestureHandler>
      </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.backdrop, 
        {
          opacity: Animated.multiply(viewScale.x, translationYvsX.interpolate({
            inputRange: [-100, 0, 100],
            outputRange: [0, 1, 0],
          })).interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
          }),
          height:  SCREEN_HEIGHT,
          width: SCREEN_WIDTH,
        }]}
      >

      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  ModalView:{
    position: 'absolute',
    zIndex:5,
  },
  
  
  pinchableImage: {

  },
  backdrop: {
    backgroundColor: 'black',
    zIndex: 4
  }
});

export default SingleMedia;
