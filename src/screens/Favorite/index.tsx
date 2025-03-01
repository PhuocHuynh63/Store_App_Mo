import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, StatusBar } from 'react-native'
import React, { useCallback, useState } from 'react'
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AntDesign from '@expo/vector-icons/AntDesign'
import { StyleShadow } from '@styles/boxShadow'
import { RootStackParamList } from 'src/types/INavigates'
import { ROUTES } from '@routes/index'
import { colors } from '@themes/colors'


const FavoriteScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()
    const numColumns = 2;

    //#region get data from async storage
    const [dataFavorite, setDataFavorite] = useState<IData.Product[]>([])
    useFocusEffect(
        useCallback(() => {
            const fetchFavorites = async () => {
                const favorites = await AsyncStorage.getItem("favorites");
                if (favorites) setDataFavorite(JSON.parse(favorites));
            };
            fetchFavorites();
        }, [])
    )
    //#endregion

    //#region handle when press favorite
    const handlePressFavorite = async (id: string) => {
        try {
            const updatedFavorites = dataFavorite.filter(fav => fav.id !== id);
            setDataFavorite(updatedFavorites);
            await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        }
        catch (error) {
            console.log(`Remove favorite error: ${error}`);
        }
    }
    //#endregion

    //#region calculate discount price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }
    //#endregion



    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View className="px-4 py-4 border-b border-gray-200">
                <Text className="text-2xl font-bold">Favorites</Text>
                <Text className="text-gray-500 mt-1">Your collection of favorite art supplies</Text>
            </View>

            {dataFavorite.length === 0 ? (
                <View className="flex-1 justify-center items-center px-4">
                    <AntDesign name="hearto" size={64} color={colors.red.bg} />
                    <Text className="text-xl font-semibold mt-4 text-center">No favorites yet</Text>
                    <Text className="text-gray-500 mt-2 text-center">
                        Start adding some products to your favorites!
                    </Text>
                </View>
            ) : (
                <FlatList<IData.Product>
                    data={dataFavorite}
                    numColumns={numColumns}
                    key={numColumns}
                    contentContainerStyle={{ padding: 8 }}
                    renderItem={({ item }) => {
                        const hasDiscount = item.limitedTimeDeal > 0;
                        const discountedPrice = item.price - item.price * item.limitedTimeDeal;

                        return (
                            <TouchableOpacity
                                className="m-2 rounded-2xl bg-white"
                                style={[styles.productCard]}
                                onPress={() => navigation.navigate(ROUTES.DETAILS, { id: item.id })}
                                activeOpacity={0.9}
                            >
                                <View className="relative">
                                    {/* Product Image with Gradient Overlay */}
                                    <View className="relative">
                                        <Image className="w-full h-44 rounded-t-2xl" source={{ uri: item.image }} resizeMode="cover" />

                                        {/* Favorite Button */}
                                        <TouchableOpacity
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 items-center justify-center"
                                            activeOpacity={0.7}
                                            onPress={(e) => {
                                                e.stopPropagation()
                                                handlePressFavorite(item.id)
                                            }}
                                        >
                                            {dataFavorite.some((fav) => fav.id === item.id) ? (
                                                <AntDesign name="heart" size={18} color={colors.red.bg} />
                                            ) : (
                                                <AntDesign name="hearto" size={18} color={colors.red.bg} />
                                            )}
                                        </TouchableOpacity>

                                        {/* Discount Badge */}
                                        {hasDiscount && (
                                            <View className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded-full">
                                                <Text className="text-white text-xs font-bold">
                                                    {Math.round(item.limitedTimeDeal * 100)}% OFF
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Product Info */}
                                    <View className="p-3">
                                        {/* Brand */}
                                        <View className="flex-row items-center mb-1">
                                            <Image source={{ uri: item.imgBrand }} className="w-4 h-4 rounded-full mr-1" />
                                            <Text className="text-xs text-gray-500">{item.brand}</Text>
                                        </View>

                                        {/* Product Name */}
                                        <Text className="text-base font-semibold mb-1" numberOfLines={1} ellipsizeMode="tail">
                                            {item.artName}
                                        </Text>

                                        {/* Description */}
                                        <Text className="text-xs text-gray-600 mb-2" numberOfLines={2} ellipsizeMode="tail">
                                            {item.description}
                                        </Text>

                                        {/* Price and Rating */}
                                        <View className="flex-row items-center justify-between mt-1">
                                            <View>
                                                {hasDiscount ? (
                                                    <View>
                                                        <Text className="text-base font-bold text-red-600">{formatPrice(discountedPrice)}</Text>
                                                        <Text className="text-xs text-gray-500 line-through">{formatPrice(item.price)}</Text>
                                                    </View>
                                                ) : (
                                                    <Text className="text-base font-bold">{formatPrice(item.price)}</Text>
                                                )}
                                            </View>

                                            {/* Glass Surface Indicator */}
                                            {item.glassSurface && (
                                                <View className="bg-blue-100 px-2 py-1 rounded-md">
                                                    <Text className="text-xs text-blue-700">Glass</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                    keyExtractor={item => item.id}
                />
            )}
        </SafeAreaView>
    )
}

export default FavoriteScreen

const styles = StyleSheet.create({
    productCard: {
        flex: 1,
        maxWidth: '47%',
        borderRadius: 16,
        backgroundColor: 'white',
        ...StyleShadow.shadow,
        elevation: 4,
    },
})
