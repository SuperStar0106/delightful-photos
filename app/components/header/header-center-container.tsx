import React from 'react'
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native'

type Props = {
  style?: StyleProp<ViewStyle>
}
export const HeaderCenterContainer: React.FC<Props> = ({ style, children }) => (
  <View style={[styles.headerCenterContainer, style]}>{children}</View>
)

const styles = StyleSheet.create({
  headerCenterContainer: {
    flex: 1,
    flexDirection: 'row',
  },
})
