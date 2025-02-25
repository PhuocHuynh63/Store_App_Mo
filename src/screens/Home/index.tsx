import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'src/types/INavigates';
import { FlatList } from 'react-native';
import httpConfig from '@utils/config';
import { ROUTES } from '@routes/index';
import { StyleShadow } from '@styles/boxShadow';
import { colors } from '@themes/colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()
    const numColumns = 2;

    //#region get data from api
    const [data, setData] = useState<IData.Product[]>([])
    const [dataBrand, setDataBrand] = useState<IData.Product[]>([])

    useFocusEffect(
        useCallback(() => {
            httpConfig.get('/')
                .then((res) => {
                    setData(res);
                    setDataBrand(res)
                })
        }, [])
    )
    //#endregion

    //#region reduce data to get unique brand
    const uniqueBrand = [{
        brand: "All",
        imgBrand: "https://png.pngtree.com/png-clipart/20190705/original/pngtree-list-vector-icon-png-image_4236974.jpg"
    }, ...dataBrand.reduce((acc, item) => {
        if (!acc.some(brandItem => brandItem.brand === item.brand)) {
            acc.push({ brand: item.brand, imgBrand: item.imgBrand });
        }
        return acc;
    }, [] as { brand: string; imgBrand: string }[])];
    //#endregion

    //#region handle filter data by brand
    const [brandSelected, setBrandSelected] = useState("All")
    const handleFilter = (selectedBrand: string) => {
        if (selectedBrand === "All") {
            setData(dataBrand)
            setBrandSelected(selectedBrand)
            return
        };
        const filterData = dataBrand.filter(item => item.brand === selectedBrand);
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
                const favorites = await AsyncStorage.getItem("favorites");
                if (favorites) setDataFavorite(JSON.parse(favorites));
            };
            fetchFavorits();
        }, [])
    );
    //#endregion

    //#region handle when press favorite
    const handlePressFavorite = async (id: string) => {
        try {
            let updatedFavorites;
            const existingIndex = dataFavorite.findIndex(fav => fav.id === id);
            if (existingIndex !== -1) {
                updatedFavorites = dataFavorite.filter(fav => fav.id !== id);
            } else {
                const selectedProduct = data.find(item => item.id === id);
                if (!selectedProduct) return;
                else updatedFavorites = [...dataFavorite, selectedProduct];
            }

            setDataFavorite(updatedFavorites);
            await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        } catch (error) {
            console.log(`Add favorite error: ${error}`);
        }
    };
    //#endregion


    return (
        <View className="bg-white flex-1">
            <View className='h-28 mt-2 border-b-2 border-gray-200'>
                <FlatList
                    data={uniqueBrand}
                    keyExtractor={(item) => item.brand}
                    horizontal
                    style={{ flex: 1 }}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity
                                className="flex-row m-3 p-3 rounded-full shadow bg-white"
                                style={[StyleShadow.shadow,
                                {
                                    backgroundColor: brandSelected === item.brand ? colors.red.bg : colors.white.bg
                                }
                                ]}
                                activeOpacity={0.7}
                                onPress={() => handleFilter(item.brand)}
                            >
                                <View className='flex-col items-center w-24'>
                                    <Image
                                        className="w-10 h-10 rounded-full"
                                        source={{ uri: item.imgBrand }}
                                        resizeMode="contain"
                                    />
                                    <Text numberOfLines={1} ellipsizeMode="tail">{item.brand}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                />
            </View>

            <View className="flex-1">
                <FlatList<IData.Product>
                    data={data}
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
        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    iconHeart: {
        position: "absolute",
        right: 10,
        bottom: 78,
        color: colors.red.bg,
    }
})