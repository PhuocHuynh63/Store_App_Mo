import { Image, StyleSheet, Text, TouchableOpacity, View, StatusBar, SafeAreaView, TextInput } from "react-native"
import { useCallback, useState } from "react"
import { type NavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "src/types/INavigates"
import { FlatList } from "react-native"
import httpConfig from "@utils/config"
import { ROUTES } from "@routes/index"
import { StyleShadow } from "@styles/boxShadow"
import { colors } from "@themes/colors"
import AntDesign from "@expo/vector-icons/AntDesign"
import AsyncStorage from "@react-native-async-storage/async-storage"

const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()
    const numColumns = 2

    //#region get data from api
    const [data, setData] = useState<IData.Product[]>([])
    const [dataBrand, setDataBrand] = useState<IData.Product[]>([])

    useFocusEffect(
        useCallback(() => {
            httpConfig.get("/").then((res) => {
                setData(res)
                setDataBrand(res)
            })
        }, []),
    )
    //#endregion

    //#region reduce data to get unique brand
    const uniqueBrand = [
        {
            brand: "All",
            imgBrand: "https://png.pngtree.com/png-clipart/20190705/original/pngtree-list-vector-icon-png-image_4236974.jpg",
        },
        ...dataBrand.reduce(
            (acc, item) => {
                if (!acc.some((brandItem) => brandItem.brand === item.brand)) {
                    acc.push({ brand: item.brand, imgBrand: item.imgBrand })
                }
                return acc
            },
            [] as { brand: string; imgBrand: string }[],
        ),
    ]
    //#endregion

    //#region handle filter data by brand
    const [brandSelected, setBrandSelected] = useState("All")
    const handleFilter = (selectedBrand: string) => {
        if (selectedBrand === "All") {
            setData(dataBrand)
            setBrandSelected(selectedBrand)
            return
        }
        const filterData = dataBrand.filter((item) => item.brand === selectedBrand)
        setData(filterData)
        setBrandSelected(selectedBrand)
    }
    //#endregion

    /**
     * Handle favorite product
     */
    //#region get data favorite from local storage
    const [dataFavorite, setDataFavorite] = useState<IData.Product[]>([])
    useFocusEffect(
        useCallback(() => {
            const fetchFavorits = async () => {
                const favorites = await AsyncStorage.getItem("favorites")
                if (favorites) setDataFavorite(JSON.parse(favorites))
            }
            fetchFavorits()
        }, []),
    )
    //#endregion

    //#region handle when press favorite
    const handlePressFavorite = async (id: string) => {
        try {
            let updatedFavorites
            const existingIndex = dataFavorite.findIndex((fav) => fav.id === id)
            if (existingIndex !== -1) {
                updatedFavorites = dataFavorite.filter((fav) => fav.id !== id)
            } else {
                const selectedProduct = data.find((item) => item.id === id)
                if (!selectedProduct) return
                else updatedFavorites = [...dataFavorite, selectedProduct]
            }

            setDataFavorite(updatedFavorites)
            await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites))
        } catch (error) {
            console.log(`Add favorite error: ${error}`)
        }
    }
    //#endregion

    //#region format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price)
    }
    //#endregion

    //#region Calculate discounted price
    const calculateDiscountedPrice = (price: number, discount: number) => {
        return price * (1 - discount)
    }
    //#endregion

    //#region handle search Product
    const handleSearchProduct = (text: string) => {
        if (text === "") {
            setData(dataBrand)
            return
        }
        const filterData = data.filter((item) => item.artName.toLowerCase().includes(text.toLowerCase()))
        setData(filterData)
    }
    //#endregion

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View className="px-4 pt-2 pb-3">
                <Text className="text-2xl font-bold">Discover</Text>
                <Text className="text-gray-500">Find amazing art supplies for your creativity</Text>
            </View>

            {/* Search */}
            <View className="px-4 py-3">
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                    <AntDesign name="search1" size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-2 text-base"
                        placeholder="Search products..."
                        placeholderTextColor="#9CA3AF"
                        onChangeText={handleSearchProduct}
                    />
                </View>
            </View>

            {/* Brand Filter */}
            <View className="border-b h-30  border-gray-100 pb-2">
                <FlatList
                    data={uniqueBrand}
                    keyExtractor={(item) => item.brand}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 12 }}
                    className="py-1"
                    renderItem={({ item }) => {
                        const isSelected = brandSelected === item.brand
                        return (
                            <TouchableOpacity
                                className="mx-2 rounded-xl overflow-hidden"
                                style={[styles.brandButton, isSelected ? styles.selectedBrand : styles.unselectedBrand]}
                                activeOpacity={0.7}
                                onPress={() => handleFilter(item.brand)}
                            >
                                <Image className="w-10 h-10 rounded-full" source={{ uri: item.imgBrand }} resizeMode="cover" />
                                <Text
                                    className={`mt-2 text-center ${isSelected ? "text-white font-semibold" : "text-gray-700"}`}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {item.brand}
                                </Text>
                            </TouchableOpacity>
                        )
                    }}
                />
            </View>

            {/* Products Grid */}
            <FlatList<IData.Product>
                data={data}
                numColumns={numColumns}
                key={numColumns}
                contentContainerStyle={{ padding: 8 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const hasDiscount = item.limitedTimeDeal > 0
                    const discountedPrice = hasDiscount ? calculateDiscountedPrice(item.price, item.limitedTimeDeal) : item.price

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
                                            <AntDesign name="heart" size={18} color="#FF3B30" />
                                        ) : (
                                            <AntDesign name="hearto" size={18} color="#FF3B30" />
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
                keyExtractor={(item) => item.id}
            />
        </SafeAreaView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    brandButton: {
        padding: 12,
        alignItems: "center",
        width: 90,
        borderRadius: 12,
        ...StyleShadow.shadow,
    },
    selectedBrand: {
        backgroundColor: colors.black.bg,
    },
    unselectedBrand: {
        backgroundColor: "white",
    },
    productCard: {
        flex: 1,
        maxWidth: "46%",
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "white",
        ...StyleShadow.shadow,
        elevation: 4,
    },
})

