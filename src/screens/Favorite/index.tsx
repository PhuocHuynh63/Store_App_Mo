import React, { useCallback, useState, useRef, useEffect } from 'react'
import { FlatList, Image, Text, TouchableOpacity, View, SafeAreaView, StatusBar, Animated, Dimensions, StyleSheet } from 'react-native'
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AntDesign from '@expo/vector-icons/AntDesign'
import { RootStackParamList } from 'src/types/INavigates'
import { ROUTES } from '@routes/index'
import { colors } from '@themes/colors'
import { StyleShadow } from '@styles/boxShadow'

const FavoriteScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()
    const numColumns = 2
    const gap = 16

    //#region get data from async storage
    const [dataFavorite, setDataFavorite] = useState<IData.Product[]>([])
    useFocusEffect(
        useCallback(() => {
            const fetchFavorites = async () => {
                const favorites = await AsyncStorage.getItem("favorites")
                if (favorites) setDataFavorite(JSON.parse(favorites))
            }
            fetchFavorites()
        }, []),
    )
    //#endregion

    //#region handle when press favorite
    const handlePressFavorite = async (id: string) => {
        try {
            const updatedFavorites = dataFavorite.filter((fav) => fav.id !== id)
            setDataFavorite(updatedFavorites)
            await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites))
        } catch (error) {
            console.log(`Remove favorite error: ${error}`)
        }
    }
    //#endregion

    //#region calculate discount price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price)
    }
    //#endregion

    //#region Selection Mode
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [isSelectMode, setIsSelectMode] = useState<boolean>(false)
    const actionBarHeight = useRef(new Animated.Value(0)).current

    // Handle selection mode changes
    useEffect(() => {
        if (isSelectMode) {
            Animated.timing(actionBarHeight, {
                toValue: 70,
                duration: 300,
                useNativeDriver: false,
            }).start()
        } else {
            Animated.timing(actionBarHeight, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start()
            setSelectedItems([])
        }
    }, [isSelectMode, actionBarHeight])

    const handleSelectItem = (id: string) => {
        setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
    }

    const handleDeleteSelected = async () => {
        try {
            const updatedFavorites = dataFavorite.filter((fav) => !selectedItems.includes(fav.id))
            setDataFavorite(updatedFavorites)
            await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites))
            setIsSelectMode(false)
        } catch (error) {
            console.log(`Delete selected error: ${error}`)
        }
    }

    const exitSelectMode = () => {
        setIsSelectMode(false)
    }
    //#endregion

    const renderItem = ({ item }: { item: IData.Product }) => {
        const hasDiscount = item.limitedTimeDeal > 0
        const discountedPrice = item.price - item.price * item.limitedTimeDeal
        const isSelected = selectedItems.includes(item.id)

        return (
            <TouchableOpacity
                className={`mb-4 rounded-2xl bg-white shadow-md ${isSelected ? 'border-2 border-blue-500' : ''}`}
                style={styles.productCard}
                onPress={() => isSelectMode
                    ? handleSelectItem(item.id)
                    : navigation.navigate(ROUTES.DETAILS, { id: item.id })
                }
                onLongPress={() => {
                    if (!isSelectMode) {
                        setIsSelectMode(true)
                        handleSelectItem(item.id)
                    }
                }}
                activeOpacity={0.9}
            >
                <View className="relative">
                    {/* Selection Indicator */}
                    {isSelectMode && (
                        <View className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-white border border-gray-300 items-center justify-center">
                            {isSelected && (
                                <View className="w-4 h-4 rounded-full bg-blue-500 items-center justify-center">
                                    <AntDesign name="check" size={12} color="white" />
                                </View>
                            )}
                        </View>
                    )}

                    {/* Product Image */}
                    <Image
                        className={`w-full h-44 rounded-t-2xl ${isSelected ? 'opacity-90' : ''}`}
                        source={{ uri: item.image }}
                        resizeMode="cover"
                    />

                    {/* Favorite Button */}
                    {!isSelectMode && (
                        <TouchableOpacity
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 items-center justify-center"
                            activeOpacity={0.7}
                            onPress={(e) => {
                                e.stopPropagation()
                                handlePressFavorite(item.id)
                            }}
                        >
                            <AntDesign name="heart" size={18} color={colors.red.bg} />
                        </TouchableOpacity>
                    )}

                    {/* Discount Badge */}
                    {hasDiscount && !isSelectMode && (
                        <View className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded-full">
                            <Text className="text-white text-xs font-bold">
                                {Math.round(item.limitedTimeDeal * 100)}% OFF
                            </Text>
                        </View>
                    )}

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

                        {/* Price and Features */}
                        <View className="flex-row items-center justify-between mt-1">
                            <View>
                                {hasDiscount ? (
                                    <>
                                        <Text className="text-base font-bold text-red-600">{formatPrice(discountedPrice)}</Text>
                                        <Text className="text-xs text-gray-500 line-through">{formatPrice(item.price)}</Text>
                                    </>
                                ) : (
                                    <Text className="text-base font-bold">{formatPrice(item.price)}</Text>
                                )}
                            </View>

                            {/* Glass Surface Indicator */}
                            {item.glassSurface && !isSelectMode && (
                                <View className="bg-blue-100 px-2 py-1 rounded-md">
                                    <Text className="text-xs text-blue-700">Glass</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View className="px-4 py-4 border-b border-gray-200 flex-row justify-between items-center">
                <View>
                    <Text className="text-2xl font-bold">Favorites</Text>
                    <Text className="text-gray-500 mt-1">Your collection of favorite art supplies</Text>
                </View>

                {isSelectMode && (
                    <TouchableOpacity
                        onPress={exitSelectMode}
                        className="p-2"
                    >
                        <Text className="text-blue-600 font-medium">Cancel</Text>
                    </TouchableOpacity>
                )}
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
                <>
                    {isSelectMode && (
                        <View className="bg-gray-100 px-4 py-2 flex-row justify-between items-center">
                            <Text className="text-gray-700">
                                {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
                            </Text>
                            {selectedItems.length > 0 && (
                                <TouchableOpacity onPress={() => setSelectedItems([])}>
                                    <Text className="text-blue-600">Clear selection</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <FlatList<IData.Product>
                        data={dataFavorite}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        numColumns={numColumns}
                        contentContainerStyle={{ padding: gap / 2, paddingBottom: isSelectMode ? 80 : gap / 2 }}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                    />

                    {/* Floating Action Bar for Selection Mode */}
                    <Animated.View
                        style={[
                            { height: actionBarHeight },
                            { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e5e7eb', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 }
                        ]}
                    >
                        <View className="flex-row justify-between items-center px-4 h-full">
                            <Text className="text-gray-700 font-medium">
                                {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
                            </Text>
                            <View className="flex-row">
                                <TouchableOpacity
                                    className="px-4 py-2 rounded-lg bg-gray-200 mr-2"
                                    onPress={exitSelectMode}
                                >
                                    <Text className="font-medium">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`px-4 py-2 rounded-lg ${selectedItems.length > 0 ? 'bg-red-500' : 'bg-gray-300'}`}
                                    onPress={handleDeleteSelected}
                                    disabled={selectedItems.length === 0}
                                >
                                    <Text className={`font-medium ${selectedItems.length > 0 ? 'text-white' : 'text-gray-500'}`}>
                                        Delete
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                </>
            )}
        </SafeAreaView>
    )
}

export default FavoriteScreen

const styles = StyleSheet.create({
    productCard: {
        flex: 1,
        maxWidth: "48%",
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "white",
        ...StyleShadow.shadow,
    },
})
