import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { RootStackParamList } from 'src/types/INavigates'
import { RouteProp, useRoute } from '@react-navigation/native'
import { ROUTES } from '@routes/index'

const DetailScreen = () => {
    const route = useRoute<RouteProp<RootStackParamList, ROUTES.DETAILS>>()

    console.log(route.params.id);
    
    return (
        <View>
            <Text>DetailScreen</Text>
        </View>
    )
}

export default DetailScreen

const styles = StyleSheet.create({})