import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import PermissionError from '../pages/PermissionError';
import React, { useRef, } from 'react';
import HomePage from '../pages/HomePage';
import {StyleSheet, Animated, View, TouchableOpacity, Text} from 'react-native';
import Header from '../components/Header';
import { createBottomTabNavigator,BottomTabBarProps,BottomTabBarOptions } from '@react-navigation/bottom-tabs';
//import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import {default as Reanimated, useSharedValue, useAnimatedStyle, } from 'react-native-reanimated';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppNavigation = () => {
  const scrollY2 = useSharedValue(0);
  const scrollY3 = useSharedValue(0);
  const scrollY4 = useSharedValue(0);

  const scale = useRef(new Animated.Value(1)).current;
  const baseScale2 = useRef(new Animated.Value(0)).current;
  const baseScale: Animated.AnimatedAddition = useRef(Animated.add(baseScale2, scale.interpolate({
    inputRange: [0, 1, 4],
    outputRange: [1, 0, -1],
  }))).current;

  const headerShown = useSharedValue(1);

  const HEADER_HEIGHT = 30;
  return (
    <Reanimated.View style={[styles.View, 
    ]}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerCenter: () => <Header scrollY2={scrollY2} scrollY3={scrollY3} scrollY4={scrollY4} HEADER_HEIGHT={HEADER_HEIGHT} headerShown={headerShown} />,
            ////headerTitle: '',
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerHideShadow:true,
            headerTranslucent:true,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="HomePage"
            options={{
              
            }}
          >
            {props => <HomeNavigation {...props} 
              scrollY2={scrollY2} 
              scrollY3={scrollY3} 
              scrollY4={scrollY4} 
              scale={scale} 
              baseScale={baseScale} 
              baseScale2={baseScale2} 
              HEADER_HEIGHT={HEADER_HEIGHT} 
              headerShown={headerShown} 
            />}
          </Stack.Screen>
          <Stack.Screen
            name="PermissionError"
            component={PermissionError}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Reanimated.View>
  );
};

interface Props {
  scrollY2: Reanimated.SharedValue<number>;
  scrollY3: Reanimated.SharedValue<number>;
  scrollY4: Reanimated.SharedValue<number>;
  scale: Animated.Value;
  baseScale: Animated.AnimatedAddition;
  baseScale2: Animated.Value;
  HEADER_HEIGHT: number;
  headerShown: Reanimated.SharedValue<number>;
}
const HomeNavigation: React.FC<Props> = (mainProps) => {
  const animatedStyle = useAnimatedStyle(()=>{
    return {
         opacity: mainProps.headerShown.value,
         height: mainProps.headerShown.value==0?0:60
      };
  });
  const TabBar = ({state, descriptors, navigation}: BottomTabBarProps<BottomTabBarOptions>) => {
    return (
      <Reanimated.View style={[animatedStyle,
        { 
          flexDirection: 'row',
          backgroundColor:"white",
          borderRadius:0,
          justifyContent:"center",
          alignItems:"center",
          shadowRadius: 2,
          shadowColor:'#000000',
          elevation: 4,
          shadowOffset: {
            width: 0,
            height: -3,
          },
        }
      ]}>
        {state.routes.map((route:any, index:any) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

              const icon =
              options.tabBarIcon !== undefined
                ? options.tabBarIcon
                : null
  
          const isFocused = state.index === index;
  
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
  
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
  
          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
  
          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{ flex: 1, alignItems:"center" }}
            >
              <View>{icon?icon({focused:isFocused,color:isFocused ? '#0a72ac' : '#3e2465',size:18}):<></>}</View>
              <Text style={{ color: isFocused ? '#0a72ac' : '#3e2465' }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Reanimated.View>
    );
  }
  return (
    <Animated.View 
      style={
        [
          styles.View,
          {
            marginTop:0, 
          }
        ]
      }>
        <Tab.Navigator 
          tabBar={props => <TabBar {...props} />}
        >
          <Tab.Screen
            name="Photos"
            options={{
              tabBarLabel: 'Photos',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="photo-video" color={color} size={size} />
              ),
            }}
          >
            {props => <HomePage {...props} 
              scrollY2={mainProps.scrollY2} 
              scrollY3={mainProps.scrollY3} 
              scrollY4={mainProps.scrollY4} 
              scale={mainProps.scale} 
              baseScale={mainProps.baseScale} 
              baseScale2={mainProps.baseScale2} 
              HEADER_HEIGHT={mainProps.HEADER_HEIGHT} 
              headerShown={mainProps.headerShown} 
            />}
          </Tab.Screen>
          <Tab.Screen
            name="Search"
            component={Search}
            options={{
              tabBarLabel: 'Search',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="search" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Library"
            component={Library}
            options={{
              tabBarLabel: 'Library',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="list-alt" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
    </Animated.View>
  );
};

function Search() {
  return (<></>);
}

function Library() {
  return (<></>);
}

const styles = StyleSheet.create({
  View: {
    flex: 1,
    //marginTop: StatusBar.currentHeight || 0,
    backgroundColor: 'white',
    position: 'relative',
  },
});
export default AppNavigation;
