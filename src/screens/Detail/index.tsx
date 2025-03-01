"use client"

import { FlatList, Image, ScrollView, Text, TextInput, View, TouchableOpacity } from "react-native"
import { useCallback, useState } from "react"
import type { RootStackParamList } from "src/types/INavigates"
import { type RouteProp, useFocusEffect, useRoute } from "@react-navigation/native"
import type { ROUTES } from "@routes/index"
import { AirbnbRating } from "react-native-ratings"
import { Controller, useForm } from "react-hook-form"
import { formatDate } from "@utils/helpers/date"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { LinearGradient } from "expo-linear-gradient"
import httpConfig from "@utils/config"
import { StatusBar } from "expo-status-bar"
import AsyncStorage from "@react-native-async-storage/async-storage"
import AntDesign from "@expo/vector-icons/AntDesign"

const DetailScreen = () => {
    const route = useRoute<RouteProp<RootStackParamList, ROUTES.DETAILS>>()
    const { id } = route.params
    const [showReviewForm, setShowReviewForm] = useState(false)

    //#region get data from api
    const [dataProduct, setDataProduct] = useState<IData.Product>({
        id: "",
        artName: "",
        price: 0,
        description: "",
        glassSurface: "",
        image: "",
        brand: "",
        imgBrand: "",
        limitedTimeDeal: 0,
        feedbacks: [],
    })

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    const res = await httpConfig.getOne(id)
                    setDataProduct(res)
                } catch (error) {
                    console.error("Error fetching data:", error)
                }
            }

            fetchData()
        }, [id]),
    )
    //#endregion

    //#region handle submit form review
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            rating: 0,
            comment: "",
            author: "",
            date: new Date().toISOString(),
        },
    })

    const onSubmit = async (data: any) => {
        try {
            const updatedProduct = {
                ...dataProduct,
                feedbacks: [...dataProduct.feedbacks, data],
            }
            setDataProduct(updatedProduct)

            await httpConfig.put(`${id}`, updatedProduct)
        } catch (error) {
            console.log(error)
        }
        setShowReviewForm(false)
        reset()
    }
    //#endregion

    //#region Calculate average rating
    const averageRating =
        dataProduct.feedbacks?.reduce((acc, item) => acc + item.rating, 0) / dataProduct.feedbacks?.length || 0
    //#endregion

    //#region handle filter star rating
    const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null)
    const filteredFeedbacks = selectedStarFilter
        ? dataProduct.feedbacks?.filter((feedback) => Math.round(feedback.rating) === selectedStarFilter)
        : dataProduct.feedbacks
    //#endregion

    const starCounts = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: dataProduct.feedbacks?.filter((feedback) => Math.round(feedback.rating) === star)?.length,
    }))

    const totalReviews = dataProduct.feedbacks?.length

    const handleStarFilter = (star: number) => {
        if (selectedStarFilter === star) {
            setSelectedStarFilter(null)
        } else {
            setSelectedStarFilter(star)
        }
    }

    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(dataProduct.price)

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
                updatedFavorites = [...dataFavorite, dataProduct]
            }

            setDataFavorite(updatedFavorites)
            await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites))
        } catch (error) {
            console.log(`Add favorite error: ${error}`)
        }
    }
    //#endregion

    return (
        <ScrollView className="flex-1 bg-white">
            <StatusBar style="light" />

            {/* Header Image with Gradient Overlay */}
            <View className="relative">
                <View>
                    <Image source={{ uri: dataProduct.image }} className="h-[400px] w-full object-cover" />
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handlePressFavorite(dataProduct.id)}
                        className="absolute top-4 right-4"
                    >
                        {dataFavorite.some((fav) => fav.id === dataProduct.id) ? (
                            <AntDesign name="heart" size={24} color="red" />
                        ) : (
                            <AntDesign name="hearto" size={24} color="red" />
                        )}
                    </TouchableOpacity>
                </View>

                {dataProduct.limitedTimeDeal > 0 && (
                    <View className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-full">
                        <Text className="text-white font-bold">{Math.round(dataProduct.limitedTimeDeal * 100)}% OFF</Text>
                    </View>
                )}

                <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} className="absolute bottom-0 w-full h-[180px]" />
                <View className="absolute bottom-8 left-6 right-6">
                    <Text className="text-3xl font-bold text-white">{dataProduct.artName}</Text>
                    <View className="flex-row items-center justify-between mt-2">
                        <View>
                            {dataProduct.limitedTimeDeal ? (
                                <View className="flex-row items-center">
                                    <Text className="text-xl text-white font-semibold">
                                        {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                        }).format(dataProduct.price * (1 - dataProduct.limitedTimeDeal))}
                                    </Text>
                                    <Text className="text-white ml-2 line-through text-sm opacity-70">{formattedPrice}</Text>
                                </View>
                            ) : (
                                <Text className="text-xl text-white font-semibold">{formattedPrice}</Text>
                            )}
                        </View>
                        <View className="flex-row items-center bg-white/20 px-3 py-1 rounded-full">
                            <FontAwesome name="star" size={16} color="#FFD700" />
                            <Text className="text-white ml-1 font-medium">{averageRating.toFixed(1)}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Product Description */}
            <View className="p-6 bg-white rounded-t-3xl -mt-4 shadow-sm">
                <Text className="text-lg text-gray-700 leading-relaxed">{dataProduct.description}</Text>

                {/* Brand Info */}
                {dataProduct.brand && (
                    <View className="mt-6 flex-row items-center">
                        {dataProduct.imgBrand && (
                            <Image source={{ uri: dataProduct.imgBrand }} className="w-12 h-12 rounded-full mr-3" />
                        )}
                        <View>
                            <Text className="text-sm text-gray-500">Brand</Text>
                            <Text className="text-base font-medium">{dataProduct.brand}</Text>
                        </View>
                    </View>
                )}

                {/* Discount Info */}
                {dataProduct.limitedTimeDeal > 0 && (
                    <View className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <AntDesign name="clockcircle" size={18} color="#DC2626" />
                                <Text className="ml-2 font-bold text-red-600">Limited Time Deal</Text>
                            </View>
                            <View className="bg-red-600 px-2 py-1 rounded-lg">
                                <Text className="text-white font-bold">{Math.round(dataProduct.limitedTimeDeal * 100)}% OFF</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center mt-2">
                            <Text className="text-lg font-bold">
                                {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                }).format(dataProduct.price * (1 - dataProduct.limitedTimeDeal))}
                            </Text>
                            <Text className="ml-2 line-through text-gray-500">{formattedPrice}</Text>
                            <Text className="ml-2 text-red-600 font-medium">
                                Save{" "}
                                {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                }).format(dataProduct.price * dataProduct.limitedTimeDeal)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Reviews Summary */}
                <View className="mt-8 mb-4">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-xl font-bold">Reviews</Text>
                        <View className="flex-row items-center">
                            <FontAwesome name="star" size={18} color="#FFD700" />
                            <Text className="ml-1 text-lg font-semibold">{averageRating.toFixed(1)}</Text>
                            <Text className="ml-1 text-gray-500">({dataProduct.feedbacks?.length})</Text>
                        </View>
                    </View>

                    {/* Add Review Button */}
                    <TouchableOpacity
                        className="mt-4 bg-black py-3 rounded-xl"
                        onPress={() => setShowReviewForm(!showReviewForm)}
                    >
                        <Text className="text-white text-center font-semibold">
                            {showReviewForm ? "Cancel Review" : "Write a Review"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Review Form */}
                {showReviewForm && (
                    <View className="bg-gray-50 p-5 rounded-2xl mb-6 shadow-sm">
                        <Text className="text-lg font-semibold mb-4 text-center">Share Your Experience</Text>

                        <Controller
                            control={control}
                            rules={{ required: true }}
                            render={({ field: { onChange, value } }) => (
                                <View className="items-center mb-6">
                                    <AirbnbRating size={24} onFinishRating={onChange} defaultRating={value} showRating={false} />
                                    {errors.rating && <Text className="text-red-500 mt-2">Please select a rating</Text>}
                                </View>
                            )}
                            name="rating"
                        />

                        <View className="gap-4">
                            <Controller
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View>
                                        <Text className="text-gray-600 mb-1 ml-1">Your Name</Text>
                                        <TextInput
                                            className="border border-gray-200 rounded-xl p-4 text-base bg-white"
                                            placeholder="Enter your name"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                        {errors.author && <Text className="text-red-500 ml-1 mt-1">Name is required</Text>}
                                    </View>
                                )}
                                name="author"
                            />

                            <Controller
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View>
                                        <Text className="text-gray-600 mb-1 ml-1">Your Review</Text>
                                        <TextInput
                                            className="border border-gray-200 rounded-xl p-4 text-base bg-white h-24"
                                            placeholder="Share your thoughts about this artwork"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            multiline={true}
                                            textAlignVertical="top"
                                        />
                                        {errors.comment && <Text className="text-red-500 ml-1 mt-1">Review text is required</Text>}
                                    </View>
                                )}
                                name="comment"
                            />
                        </View>

                        <TouchableOpacity className="mt-6 bg-black py-3 rounded-xl" onPress={handleSubmit(onSubmit)}>
                            <Text className="text-white text-center font-semibold">Submit Review</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Star Rating Filter */}
                <View className="mt-4 mb-6">
                    <Text className="text-base font-semibold mb-3">Filter by Rating</Text>

                    {starCounts.map(({ star, count }) => (
                        <TouchableOpacity
                            key={star}
                            className={`flex-row items-center mb-2 ${selectedStarFilter === star ? "bg-gray-100 p-2 rounded-lg" : ""}`}
                            onPress={() => handleStarFilter(star)}
                        >
                            <View className="flex-row items-center w-16">
                                <FontAwesome name="star" size={16} color="#FFD700" style={{ marginRight: 4 }} />
                                <Text className="font-medium">{star}</Text>
                            </View>

                            <View className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                                <View
                                    className="h-2 bg-yellow-400 rounded-full"
                                    style={{ width: `${totalReviews ? (count / totalReviews) * 100 : 0}%` }}
                                />
                            </View>

                            <Text className="text-gray-500 w-8 text-right">{count}</Text>
                        </TouchableOpacity>
                    ))}

                    {selectedStarFilter && (
                        <TouchableOpacity
                            className="mt-2 py-2 px-4 bg-gray-200 self-start rounded-full"
                            onPress={() => setSelectedStarFilter(null)}
                        >
                            <Text className="text-sm font-medium">Clear Filter</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Reviews List */}
                <View className="mt-2">
                    {selectedStarFilter && (
                        <Text className="mb-4 text-base">
                            Showing {filteredFeedbacks?.length} {filteredFeedbacks?.length === 1 ? "review" : "reviews"} with{" "}
                            {selectedStarFilter} {selectedStarFilter === 1 ? "star" : "stars"}
                        </Text>
                    )}

                    {filteredFeedbacks?.length === 0 ? (
                        <View className="py-8 items-center">
                            <FontAwesome name="comment-o" size={40} color="#D1D5DB" />
                            <Text className="mt-2 text-gray-400 text-center">
                                {selectedStarFilter
                                    ? `No ${selectedStarFilter}-star reviews yet`
                                    : "No reviews yet. Be the first to review!"}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredFeedbacks}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <View className="mb-6 bg-gray-50 p-4 rounded-xl shadow-sm">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <View className="flex-row items-center">
                                            <View className="w-10 h-10 bg-black rounded-full items-center justify-center">
                                                <Text className="font-bold text-white">{item.author.charAt(0).toUpperCase()}</Text>
                                            </View>
                                            <Text className="font-bold ml-3">{item.author}</Text>
                                        </View>
                                        <Text className="text-gray-500 text-sm">{formatDate(item.date)}</Text>
                                    </View>

                                    <View className="flex-row items-center mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <FontAwesome
                                                key={i}
                                                name="star"
                                                size={14}
                                                color={i < item.rating ? "#FFD700" : "#D3D3D3"}
                                                style={{ marginRight: 2 }}
                                            />
                                        ))}
                                    </View>

                                    <Text className="text-gray-700">{item.comment}</Text>
                                </View>
                            )}
                        />
                    )}
                </View>
            </View>
        </ScrollView>
    )
}

export default DetailScreen

