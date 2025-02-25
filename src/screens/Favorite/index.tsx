import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AntDesign from '@expo/vector-icons/AntDesign';
import { StyleShadow } from '@styles/boxShadow'
import { RootStackParamList } from 'src/types/INavigates'
import { ROUTES } from '@routes/index'
import { colors } from '@themes/colors'

const FavoriteScreen = () => {
    const [dataFavorite, setDataFavorite] = useState<IData.Product[]>([])
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()
    const numColumns = 2;

    useFocusEffect(
        useCallback(() => {
            const fetchFavorites = async () => {
                const favorites = await AsyncStorage.getItem("favorites");
                if (favorites) setDataFavorite(JSON.parse(favorites));
            };
            fetchFavorites();
        }, [])
    )

    const handlePressFavorite = async (id: string) => {
        try {
            let updatedFavorites;
            const existingIndex = dataFavorite.findIndex(fav => fav.id === id);
            if (existingIndex !== -1) {
                updatedFavorites = dataFavorite.filter(fav => fav.id !== id);
            } else {
                const selectedProduct = dataFavorite.find(item => item.id === id);
                if (!selectedProduct) return;
                else updatedFavorites = [...dataFavorite, selectedProduct];
            }

            setDataFavorite(updatedFavorites);
            await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        }
        catch (error) {
            console.log(`Add favorite error: ${error}`);
        }
    }

    return (
        <View className="flex-1">
            <FlatList<IData.Product>
                data={dataFavorite}
                numColumns={numColumns}
                key={numColumns}
                style={{ flex: 4 }}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity className="m-2 p-3 rounded-2xl shadow bg-white"
                            style={[StyleShadow.shadow, { width: "46%" }]}
                            onPress={() => navigation.navigate(ROUTES.DETAILS, { id: item.id })}
                            activeOpacity={0.87}
                        >
                            <View>
                                <Image
                                    className="w-full h-32 rounded-md"
                                    source={{ uri: item.image }}
                                />

                                <TouchableOpacity
                                    style={{ position: 'relative' }}
                                    activeOpacity={0.7}
                                    onPress={() => handlePressFavorite(item.id)}
                                >
                                    {dataFavorite.some(fav => fav.id === item.id) ? (
                                        <AntDesign name="heart" size={24} color="red" style={styles.iconHeart} />
                                    ) : (
                                        <AntDesign name="hearto" size={24} color="black" style={styles.iconHeart} />
                                    )}
                                </TouchableOpacity>

                            </View>
                            <View className="flex justify-between items-center mt-2">
                                <Text
                                    className="text-lg font-semibold h-"
                                    numberOfLines={2}
                                    ellipsizeMode='tail'>{item.artName}</Text>
                                <Text className="text-lg font-semibold">{item.price}</Text>
                            </View>
                            <View className="border-b border-gray-300 my-2" />
                            <Text
                                className="mt-2 text-gray-700 visible"
                                numberOfLines={3} ellipsizeMode="tail"
                            >{item.description}</Text>
                        </TouchableOpacity>
                    )
                }}
                keyExtractor={item => item.id}
            />
        </View>
    )
}

export default FavoriteScreen

const styles = StyleSheet.create({
    iconHeart: {
        position: "absolute",
        right: 10,
        bottom: 78,
        color: colors.red.bg,
    }
})